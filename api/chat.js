export const config = { runtime: 'edge' };

// Change the model here only. The page's own "model" value is ignored.
const MODEL = 'openai/gpt-oss-20b';

// Sites allowed to call this function from a browser.
const ALLOWED_ORIGINS = [
  'https://raphaelana-github-io.vercel.app',
  'https://raphaelana.github.io',
];

function corsHeaders(req) {
  const origin = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(data, status, req) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, req);
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return json({ error: 'API key not configured' }, 500, req);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400, req);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: 'No messages provided' }, 400, req);
  }

  // Keep the system prompt (retrieved passages) plus the last 10 turns,
  // so long chats stay within the free-plan token limits.
  const system = body.messages.filter((m) => m.role === 'system');
  const recent = body.messages.filter((m) => m.role !== 'system').slice(-10);

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [...system, ...recent],
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.3,
        max_completion_tokens: 1024,
        reasoning_effort: 'low',
        include_reasoning: false,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      const message =
        groqRes.status === 429
          ? 'Too many questions right now. Please try again in a minute.'
          : data?.error?.message || 'The language model returned an error.';
      return json({ error: message, detail: data?.error }, groqRes.status, req);
    }

    return json(data, 200, req);
  } catch (err) {
    return json({ error: `Could not reach the language model: ${err.message}` }, 502, req);
  }
}
