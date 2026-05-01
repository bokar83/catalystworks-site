/**
 * Catalyst Works - Diagnostic Worker (Cloudflare)
 *
 * Hybrid AI proxy for the v3 hero demo. Deploy this to a Cloudflare Worker,
 * set ANTHROPIC_API_KEY as a secret, set the worker URL in index.html WORKER_URL.
 *
 * Quota: ~50 free diagnostics per IP per day (uses Workers KV or just an in-memory
 * Map per isolate as a soft limit; KV is recommended for prod).
 *
 * Deploy:
 *   wrangler init catalyst-diagnostic
 *   # paste this file as src/index.js
 *   # add: wrangler secret put ANTHROPIC_API_KEY
 *   # wrangler deploy
 *
 * Then update WORKER_URL in index.html to the deployed URL.
 */

const SYSTEM_PROMPT = `You are Boubacar Barry's diagnostic protocol. You run a five-lens analysis (Throughput, Friction, Decision, Information, Inference) on a one-sentence business pain a visitor describes.

Output a JSON object with exactly three fields:
- "constraint": ONE sentence naming the suspected single constraint, specific and cross-functional. Use the operator's vocabulary, not consulting jargon.
- "signals": an array of EXACTLY 3 strings, each one friction signal with implication. 1-2 sentences each.
- "action": ONE concrete action the operator can take before Friday. 1-2 sentences. Specific, doable.

Rules:
- Do not hedge. Diagnose decisively.
- Do not use em-dashes anywhere.
- Use short declarative sentences. Periods over conjunctions.
- The voice is Catalyst Works: blunt, specific, written by an operator who has been in the room.
- Do not include any text outside the JSON object. No preamble. No epilogue.`;

const RATE_LIMIT_PER_IP_PER_DAY = 50;
const _quotaMap = new Map(); // soft per-isolate limit; use KV for hard limit

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405);
    }

    // Rate limit by IP
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const dayKey = ip + ':' + new Date().toISOString().slice(0, 10);
    const used = _quotaMap.get(dayKey) || 0;
    if (used >= RATE_LIMIT_PER_IP_PER_DAY) {
      return json({ error: 'quota_exceeded', message: 'Daily diagnostic limit reached for your IP. Try again tomorrow, or book a real Signal Session.' }, 429);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'bad_json' }, 400);
    }
    const pain = (body && typeof body.pain === 'string') ? body.pain.trim() : '';
    if (pain.length < 12 || pain.length > 1200) {
      return json({ error: 'bad_input' }, 400);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'no_key', message: 'Worker not configured. Site falls back to simulated mode.' }, 500);
    }

    try {
      const apiResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 700,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: pain }],
        }),
      });

      if (!apiResp.ok) {
        const errText = await apiResp.text();
        console.error('anthropic api error', apiResp.status, errText);
        return json({ error: 'api_failed', status: apiResp.status }, 502);
      }

      const data = await apiResp.json();
      const text = data?.content?.[0]?.text || '';
      const parsed = extractJson(text);
      if (!parsed || !parsed.constraint || !Array.isArray(parsed.signals) || !parsed.action) {
        console.error('parse failed', text.slice(0, 300));
        return json({ error: 'parse_failed' }, 502);
      }

      _quotaMap.set(dayKey, used + 1);
      return json(parsed);
    } catch (e) {
      console.error('worker exception', e);
      return json({ error: 'exception', message: String(e) }, 500);
    }
  },
};

function extractJson(s) {
  // Tolerant JSON extraction: find the first { and last } and parse between.
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}
