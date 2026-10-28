<?php
/*
 * Prompts That Push Back: server-side email gate (2026-09-24).
 *
 * WHY PHP AND NOT A CLIENT-SIDE REVEAL: this repo is PUBLIC on GitHub. Anything committed
 * here, including a "hidden" block of HTML or a key in page JS, can be read without giving
 * an email. So the prompt text is NOT in this repo at all. It lives one level ABOVE
 * public_html on the Hostinger host (installed by install.php) and its source of truth is
 * the private agentHQ repo: docs/prds/cw-prompts-that-push-back/gated-content.html.
 *
 * FLOW: the page POSTs {email, utm_*} here. This script performs the capture itself,
 * server-side, against the same proven endpoint every Catalyst Works capture uses
 * (/workshop-register, magnet cohort), and returns the prompt HTML ONLY when that capture
 * reports success. There is no way to get the content without a capture attempt.
 *
 * Capture success mirrors ai-unstuck exactly: body ok:true, or error "duplicate" (already
 * subscribed; the DB upsert still runs). Anything else returns no content.
 *
 * Known limit: the capture call originates from the Hostinger server, and the VPS proxy
 * does not trust forwarded headers from it, so /workshop-register's 5-per-minute rate limit
 * is shared by every visitor of this page. On rate_limited the page waits and retries.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private, max-age=0');
header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff');

function out($code, $arr) { http_response_code($code); echo json_encode($arr); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    out(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$raw = file_get_contents('php://input', false, null, 0, 8192);
$in = json_decode($raw ?: '', true);
if (!is_array($in)) { $in = []; }

function field($in, $k, $max) {
    $v = isset($in[$k]) && is_string($in[$k]) ? trim($in[$k]) : '';
    return mb_substr($v, 0, $max);
}

// Honeypot: bots see success and get nothing.
if (field($in, 'website', 200) !== '') { out(200, ['ok' => true, 'html' => '']); }

$email = field($in, 'email', 254);
if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) {
    out(200, ['ok' => false, 'error' => 'invalid_email']);
}

$SOURCE = 'cw_prompts_push_back_page';
$payload = [
    'email'         => $email,
    'cohort'        => 'lm_cw_prompts_push_back',
    'magnet'        => 'cw_prompts_push_back',
    'form_location' => $SOURCE,
    'seat_kind'     => 'free',
    'reg_ref'       => preg_replace('/[^A-Za-z0-9_-]/', '', field($in, 'reg_ref', 80)),
    'utm_source'    => field($in, 'utm_source', 64) ?: 'cw_prompts_push_back',
    'utm_medium'    => field($in, 'utm_medium', 64) ?: 'organic',
    'utm_campaign'  => field($in, 'utm_campaign', 120) ?: 'lm_cw_prompts_push_back',
    'utm_content'   => field($in, 'utm_content', 120) ?: $SOURCE,
];

function capture_once($payload) {
    $url = 'https://agentshq.boubacarbarry.com/api/orc/workshop-register';
    $body = json_encode($payload);
    $headers = ['Content-Type: application/json', 'Accept: application/json',
                'Origin: https://catalystworks.consulting'];
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15]);
        $resp = curl_exec($ch);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => implode("\r\n", $headers),
            'content' => $body, 'timeout' => 15, 'ignore_errors' => true]]);
        $resp = @file_get_contents($url, false, $ctx);
    }
    if ($resp === false || $resp === null || $resp === '') { return 'fail'; }
    $b = json_decode($resp, true);
    if (!is_array($b)) { return 'fail'; }
    if (($b['ok'] ?? null) === true) { return 'ok'; }
    $err = $b['error'] ?? '';
    if ($err === 'duplicate') { return 'ok'; }
    if ($err === 'invalid_email') { return 'invalid_email'; }
    if ($err === 'rate_limited') { return 'rate_limited'; }
    if (($b['detail'] ?? '') === 'invalid email') { return 'invalid_email'; }
    return 'fail';
}

$state = 'fail';
foreach ([0, 250000, 750000] as $wait) {
    if ($wait) { usleep($wait); }
    $state = capture_once($payload);
    if ($state !== 'fail') { break; }
}
if ($state !== 'ok') { out(200, ['ok' => false, 'error' => $state]); }

$path = dirname($_SERVER['DOCUMENT_ROOT']) . '/.gated/prompts-that-push-back.html';
$html = is_readable($path) ? file_get_contents($path) : false;
if ($html === false || $html === '') {
    error_log('prompts-that-push-back: gated content missing at ' . $path);
    out(200, ['ok' => false, 'error' => 'content_unavailable']);
}
$pos = strpos($html, '<!--BEGIN-->');
if ($pos !== false) { $html = substr($html, $pos + strlen('<!--BEGIN-->')); }

out(200, ['ok' => true, 'html' => $html]);
