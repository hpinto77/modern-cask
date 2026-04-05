// netlify/functions/whisky.js
// Proxy for WHISKY:EDITION API — server-side to bypass CORS
// Also proxies Gemini Vision calls to keep API key server-side

const WHISKY_API = 'https://thewhiskyedition.com/api/whisky-reviews';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = new URLSearchParams(event.queryStringParameters || {});

  // Route: Gemini vision proxy
  if (params.get('action') === 'gemini-vision') {
    if (!GEMINI_KEY) {
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'Gemini not configured' }) };
    }
    try {
      const body = JSON.parse(event.body || '{}');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // Route: single whisky detail
  const slug = params.get('slug');
  params.delete('slug');
  params.delete('action');

  let url;
  if (slug) {
    url = `${WHISKY_API}/${encodeURIComponent(slug)}`;
  } else {
    if (!params.has('type')) params.set('type', 'Single Malt');
    url = `${WHISKY_API}?${params}`;
  }

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TheModernCask/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({ error: `API ${res.status}` }) };
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: e.message }) };
  }
};
