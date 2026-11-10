<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/enquiry.php';

function check(bool $condition, string $message): void {
    if (!$condition) { throw new RuntimeException($message); }
}
$valid = ['name' => 'Test customer', 'company' => 'Example Ltd', 'email' => 'customer@example.com', 'phone' => '+61 400 000 000', 'requirement' => "Branch network\nFirewall upgrade", 'website' => ''];
check(validateEnquiry($valid)['errors'] === [], 'Valid enquiry accepted');
foreach (['name', 'email', 'requirement'] as $field) {
    $input = $valid; $input[$field] = '  ';
    check(isset(validateEnquiry($input)['errors'][$field]), "$field is required on server");
}
foreach (['invalid', "a@example.com\r\nBcc: someone@example.com", ['nested'], str_repeat('a', 255) . '@example.com'] as $email) {
    $input = $valid; $input['email'] = $email;
    check(isset(validateEnquiry($input)['errors']['email']), 'Invalid email rejected');
}
$input = $valid; $input['requirement'] = str_repeat('a', 6001);
check(isset(validateEnquiry($input)['errors']['requirement']), 'Oversized message rejected');
$input = $valid; $input['website'] = 'spam.example';
check(isset(validateEnquiry($input)['errors']['website']), 'Honeypot rejected');
$input = $valid; $input['name'] = "invalid\0name";
check(isset(validateEnquiry($input)['errors']['name']), 'Control characters rejected');
$input = $valid; $input['name'] = '  Nguyễn An  ';
check(validateEnquiry($input)['data']['name'] === 'Nguyễn An', 'Unicode text preserved and trimmed');

$rateDir = sys_get_temp_dir() . '/payorbit-test-' . bin2hex(random_bytes(6));
try {
    for ($i = 0; $i < 5; $i++) check(consumeEnquiryQuota($rateDir, 'test-client', 1000), 'First five attempts allowed');
    check(!consumeEnquiryQuota($rateDir, 'test-client', 1001), 'Sixth attempt rejected');
    check(consumeEnquiryQuota($rateDir, 'other-client', 1001), 'Independent client allowed');
    check(consumeEnquiryQuota($rateDir, 'test-client', 1601), 'Quota expires after ten minutes');
} finally {
    foreach (glob($rateDir . '/*') ?: [] as $file) unlink($file);
    if (is_dir($rateDir)) rmdir($rateDir);
}
$mail = createEnquiryMailer(['smtp_password' => 'local-test-only'], $valid);
check($mail->Host === 'smtp.titan.email' && $mail->Port === 465 && $mail->SMTPSecure === 'ssl', 'Titan uses authenticated implicit TLS');
check($mail->SMTPAuth && $mail->Username === 'sales@payorbit.com.au', 'Sales mailbox authenticates');
check($mail->From === 'sales@payorbit.com.au', 'Visitor never controls From');
check($mail->getToAddresses() === [['sales@payorbit.com.au', 'PAY ORBIT Sales']], 'Recipient fixed to sales');
check($mail->getReplyToAddresses() === [['customer@example.com', 'Test customer']], 'Reply-To belongs to visitor');
check($mail->preSend(), 'Real PHPMailer builds message');
$mime = $mail->getSentMIMEMessage();
check(str_contains($mime, 'Branch network') && str_contains($mime, 'Example Ltd'), 'Message contains enquiry fields');
check(!str_contains($mime, 'local-test-only'), 'Password absent from message');
echo "PASS: enquiry validation, quota expiry and real PHPMailer message\n";
