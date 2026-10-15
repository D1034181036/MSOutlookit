<?php
header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    exit(json_encode(['error' => 'config.php not found, copy config.sample.php']));
}
$config = require $configFile;

$path = $_GET['path'] ?? '';
if (!preg_match('#^/[A-Za-z0-9_/.\-]*$#', $path) || str_contains($path, '..')) {
    http_response_code(400);
    exit(json_encode(['error' => 'invalid path']));
}

$query = $_GET;
unset($query['path']);
$query['raw_json'] = 0;

$ch = curl_init("https://www.reddit.com{$path}?" . http_build_query($query));
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_USERAGENT => $config['user_agent'],
    CURLOPT_HTTPHEADER => ["Cookie: {$config['cookie']}"],
]);
$body = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

http_response_code($status ?: 502);
echo $body;
