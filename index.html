// api/chat.js — Vercel Edge Function
// Проксирует запросы к https://api.etage.one/v1/chat/completions
// Ключ API хранится в переменной окружения ETAGE_API_KEY (НЕ во фронтенде)

export const config = { runtime: 'edge' };

const UPSTREAM_URL = 'https://api.etage.one/v1/chat/completions';

export default async function handler(req) {
  // CORS (на случай если фронт и API на разных поддоменах)
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
      JSON.stringify({ error: 'Server misconfiguration: ETAGE_API_KEY not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Системный промпт — чтобы чат не уходил в сторону
  const systemPrompt =
    'Ты — ИИ-консультант сайта "Шилов Медиа". Отвечай на русском языке, ' +
    'кратко и по делу. Ты помогаешь с вопросами о вайбкодинге, нейросетях, ' +
    'разработке сайтов, телеграм-ботах, ценах и услугах. Если спрашивают о ' +
    'цене — ориентируйся на: лендинг от 15 000 ₽, телеграм-бот от 10 000 ₽, ' +
    'бот с нейросетью от 25 000 ₽, MVP от 30 000 ₽, интеграция ИИ от 20 000 ₽, ' +
    'консультация 2 000 ₽/час. Если задача сложная или нужен точный расчёт — ' +
    'предложи написать в Telegram @shilovmedia. Можешь использовать Markdown, ' +
    'таблицы, формулы и код, если это уместно. Не выдумывай факты о компании, ' +
    'которых не знаешь.';

  const payload = {
    model: 'glm-5.2',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 2048,
    stream: false, // упрощаем: без стриминга на клиенте, но можно включить
    // enable_thinking: false, // если нужно отключить режим размышления
  };

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
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

    const data = await upstream.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      '';

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Network error', details: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
