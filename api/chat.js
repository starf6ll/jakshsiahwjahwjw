// api/chat.js — Vercel Edge Function
// Проксирует стриминговый ответ от https://api.etage.one/v1/chat/completions
// и отдаёт его браузеру как SSE / ReadableStream.

export const config = { runtime: 'edge' };

const UPSTREAM_URL = 'https://api.etage.one/v1/chat/completions';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ETAGE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ETAGE_API_KEY not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const systemPrompt =
    'Ты — ИИ-консультант сайта "Шилов Медиа". Отвечай по-русски, кратко и по делу. ' +
    'Помогаешь с вопросами о вайбкодинге, нейросетях, разработке сайтов и телеграм-ботах. ' +
    'Цены: лендинг от 15 000 ₽, бот от 10 000 ₽, бот с нейросетью от 25 000 ₽, ' +
    'MVP от 30 000 ₽, интеграция ИИ от 20 000 ₽, консультация 2 000 ₽/час. ' +
    'Для точного расчёта предлагай написать в Telegram @shilovmedia. ' +
    'Используй Markdown, таблицы, формулы и код, когда уместно. Не выдумывай факты.';

  const payload = {
    model: 'glm-5.2',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true, // ← включаем стриминг
  };

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return new Response(
        JSON.stringify({ error: 'Upstream error', status: upstream.status, details: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Проксируем SSE-поток как есть — браузер сам распарсит `data:` чанки.
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Network error', details: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
