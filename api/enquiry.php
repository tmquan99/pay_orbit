<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST'); respond(405, ['ok' => false]);
}
if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') respond(415, ['ok' => false]);
$body = file_get_contents('php://input', false, null, 0, 32769);
if ($body === false || strlen($body) > 32768) respond(413, ['ok' => false]);
try { $input = json_decode($body, true, 16, JSON_THROW_ON_ERROR); }
catch (JsonException $error) { respond(400, ['ok' => false]); }
if (!is_array($input) || array_is_list($input)) respond(400, ['ok' => false]);

require __DIR__ . '/lib/enquiry.php';
$validated = validateEnquiry($input);
if ($validated['errors']) respond(422, ['ok' => false, 'errors' => $validated['errors']]);

// Credentials live beside public_html, never inside a downloadable website folder.
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__);
$configFile = getenv('PAYORBIT_MAIL_CONFIG') ?: dirname($documentRoot) . '/payorbit-mail.php';
try {
    if (!is_file($configFile)) throw new RuntimeException('Missing mail configuration');
    $config = require $configFile;
    if (!is_array($config) || !is_string($config['smtp_password'] ?? null) || trim($config['smtp_password']) === '' || $config['smtp_password'] === 'REPLACE_WITH_TITAN_PASSWORD') throw new RuntimeException('Missing SMTP password');
    $origins = $config['allowed_origins'] ?? ['https://payorbit.com.au', 'https://www.payorbit.com.au'];
    if (isset($_SERVER['HTTP_ORIGIN']) && !in_array($_SERVER['HTTP_ORIGIN'], $origins, true)) respond(403, ['ok' => false]);
    $directory = $config['rate_directory'] ?? sys_get_temp_dir() . '/payorbit-enquiry-' . substr(hash('sha256', __DIR__), 0, 16);
    $client = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $config['smtp_password']);
    if (!consumeEnquiryQuota($directory, $client, time())) {
        header('Retry-After: 600'); respond(429, ['ok' => false]);
    }
} catch (Throwable $error) {
    error_log('PAY ORBIT enquiry: mail configuration or quota storage unavailable');
    respond(503, ['ok' => false]);
}
try {
    createEnquiryMailer($config, $validated['data'])->send();
    respond(200, ['ok' => true]);
} catch (Throwable $error) {
    // Never expose credentials, customer details or SMTP transcripts in responses/logs.
    error_log('PAY ORBIT enquiry: SMTP delivery failed');
    respond(502, ['ok' => false]);
}
