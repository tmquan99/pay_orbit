<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/phpmailer/src/Exception.php';
require_once __DIR__ . '/phpmailer/src/SMTP.php';
require_once __DIR__ . '/phpmailer/src/PHPMailer.php';

function validateEnquiry(array $input): array {
    $data = []; $errors = [];
    foreach (['name' => 160, 'company' => 200, 'email' => 254, 'phone' => 60, 'requirement' => 6000, 'website' => 200] as $field => $limit) {
        $value = $input[$field] ?? '';
        if (!is_string($value) || preg_match('//u', $value) !== 1) {
            $errors[$field] = 'invalid'; $data[$field] = ''; continue;
        }
        $value = trim($value);
        $data[$field] = $value;
        $length = preg_match_all('/./us', $value);
        $controls = $field === 'requirement' ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/' : '/[\x00-\x1F\x7F]/';
        if ($length > $limit || preg_match($controls, $value)) $errors[$field] = 'invalid';
        if (in_array($field, ['name', 'email', 'requirement'], true) && $value === '') $errors[$field] = 'required';
    }
    if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'invalid';
    if ($data['website'] !== '') $errors['website'] = 'invalid';
    return ['data' => $data, 'errors' => $errors];
}

/** Lock before reading and writing so parallel requests share the same quota. */
function consumeEnquiryQuota(string $directory, string $client, int $now): bool {
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) throw new RuntimeException('Quota storage unavailable');
    $file = @fopen($directory . '/' . hash('sha256', $client) . '.json', 'c+');
    if (!$file) throw new RuntimeException('Quota storage unavailable');
    try {
        if (!flock($file, LOCK_EX)) throw new RuntimeException('Quota lock unavailable');
        $stored = stream_get_contents($file);
        $attempts = $stored === '' ? [] : json_decode($stored, true, 16, JSON_THROW_ON_ERROR);
        if (!is_array($attempts)) throw new RuntimeException('Invalid quota storage');
        $attempts = array_values(array_filter($attempts, fn($time) => is_int($time) && $time > $now - 600));
        if (count($attempts) >= 5) return false;
        $attempts[] = $now;
        rewind($file);
        if (!ftruncate($file, 0) || fwrite($file, json_encode($attempts, JSON_THROW_ON_ERROR)) === false || !fflush($file)) throw new RuntimeException('Quota write failed');
        return true;
    } finally { flock($file, LOCK_UN); fclose($file); }
}

function createEnquiryMailer(array $config, array $data): PHPMailer {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'] ?? 'smtp.titan.email';
    $mail->Port = (int) ($config['smtp_port'] ?? 465);
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->SMTPAuth = true;
    $mail->Username = 'sales@payorbit.com.au';
    $mail->Password = $config['smtp_password'];
    $mail->Timeout = 15;
    $mail->getSMTPInstance()->Timelimit = 20;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->setFrom('sales@payorbit.com.au', 'PAY ORBIT Website');
    $mail->addAddress('sales@payorbit.com.au', 'PAY ORBIT Sales');
    $mail->addReplyTo($data['email'], $data['name']);
    $mail->Subject = 'New website enquiry | PAY ORBIT';
    $mail->isHTML(false);
    $lines = ['New enquiry from the PAY ORBIT website', ''];
    foreach (['name' => 'Name', 'company' => 'Company', 'email' => 'Email', 'phone' => 'Phone', 'requirement' => 'Requirement'] as $field => $label) {
        if ($data[$field] !== '') $lines[] = $label . ': ' . $data[$field];
    }
    $mail->Body = implode("\n", $lines);
    return $mail;
}
