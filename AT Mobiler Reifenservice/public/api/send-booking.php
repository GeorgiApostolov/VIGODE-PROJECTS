<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$name = isset($data['name']) ? $data['name'] : 'N/A';
$phone = isset($data['phone']) ? $data['phone'] : 'N/A';
$email = isset($data['email']) ? $data['email'] : 'Nicht angegeben';
$postalCode = isset($data['postalCode']) ? $data['postalCode'] : 'N/A';
$city = isset($data['city']) ? $data['city'] : 'N/A';
$address = isset($data['address']) ? $data['address'] : 'N/A';
$services = isset($data['services']) ? $data['services'] : 'N/A';
$preferredDate = isset($data['preferredDate']) ? $data['preferredDate'] : 'N/A';
$preferredTime = isset($data['preferredTime']) ? $data['preferredTime'] : 'N/A';
$notes = isset($data['notes']) ? $data['notes'] : 'Keine Anmerkungen';

$to = 'at.mobiler.reifenservice@gmail.com';
$subject = '🚗 Neue Terminanfrage - ' . $name;
$from = 'atmobile@at-mobiler-reifenservice.de';

$message = "
Neue Terminanfrage von der Website
=====================================

KONTAKTDATEN:
-------------
Name: {$name}
Telefon: {$phone}
E-Mail: {$email}

STANDORT:
---------
PLZ: {$postalCode}
Stadt: {$city}
Adresse: {$address}

DIENSTLEISTUNGEN:
-----------------
{$services}

WUNSCHTERMIN:
-------------
Datum: {$preferredDate}
Uhrzeit: {$preferredTime}

ANMERKUNGEN:
------------
{$notes}

=====================================
Diese Anfrage wurde über das Buchungsformular auf at-mobiler-reifenservice.de gesendet.
";

$headers = "From: {$from}\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$success = mail($to, $subject, $message, $headers);

if ($success) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send email'
    ]);
}
?>
