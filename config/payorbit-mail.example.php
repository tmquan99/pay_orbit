<?php
// Copy to /home/YOUR_CPANEL_USER/payorbit-mail.php, OUTSIDE public_html.
return [
    'smtp_host' => 'smtp.titan.email',
    'smtp_port' => 465,
    'smtp_password' => 'REPLACE_WITH_TITAN_PASSWORD',
    'allowed_origins' => ['https://payorbit.com.au', 'https://www.payorbit.com.au'],
];
