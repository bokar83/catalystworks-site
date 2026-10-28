<?php
/*
 * Installs (or updates) the gated prompt content for /prompts-that-push-back/ ONE LEVEL
 * ABOVE public_html, where no HTTP request can reach it and the GitHub deploy never
 * touches it. unlock.php reads it from there after a successful email capture.
 *
 * Token-guarded. Only the SHA-256 of the token is in this (public) repo; the token itself
 * is CW_GATED_CONTENT_INSTALL_TOKEN in the private agentHQ .env. Source of the content:
 * agentHQ docs/prds/cw-prompts-that-push-back/gated-content.html.
 *
 *   POST  body = the HTML, header X-Install-Token  -> writes it, returns bytes + sha256
 *   GET   header X-Install-Token                    -> returns bytes + sha256 of what is live
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private, max-age=0');
header('X-Robots-Tag: noindex, nofollow');

const TOKEN_SHA256 = 'a3f20d4bc28f71d92cd986b6fb8a9fc2e34e6fcac66680a00b4f611aeffe57d8';

$tok = $_SERVER['HTTP_X_INSTALL_TOKEN'] ?? '';
if (!is_string($tok) || $tok === '' || !hash_equals(TOKEN_SHA256, hash('sha256', $tok))) {
    http_response_code(404);
    echo json_encode(['ok' => false]);
    exit;
}

$dir = dirname($_SERVER['DOCUMENT_ROOT']) . '/.gated';
$path = $dir . '/prompts-that-push-back.html';
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $c = is_readable($path) ? file_get_contents($path) : '';
    echo json_encode(['ok' => $c !== '', 'bytes' => strlen($c), 'sha256' => hash('sha256', $c)]);
    exit;
}
if ($method !== 'POST') { http_response_code(405); echo json_encode(['ok' => false]); exit; }

$body = file_get_contents('php://input', false, null, 0, 262144);
if (!is_string($body) || strpos($body, '<!--BEGIN-->') === false) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'body must contain the BEGIN marker']);
    exit;
}
if (!is_dir($dir) && !mkdir($dir, 0750, true)) {
    http_response_code(500); echo json_encode(['ok' => false, 'error' => 'mkdir']); exit;
}
$tmp = $path . '.tmp';
if (file_put_contents($tmp, $body) === false || !rename($tmp, $path)) {
    http_response_code(500); echo json_encode(['ok' => false, 'error' => 'write']); exit;
}
$c = file_get_contents($path);
echo json_encode(['ok' => true, 'bytes' => strlen($c), 'sha256' => hash('sha256', $c), 'path_above_webroot' => true]);
