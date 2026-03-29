/**
 * Shared OpenAI REST helper for Vercel serverless routes (Node 18+).
 * Requires OPENAI_API_KEY in Vercel project settings.
 */

export async function openaiChatJson({ system, user, model }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('OPENAI_API_KEY is not set');
    err.code = 'NO_KEY';
    throw err;
  }
  const m = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: m,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    const e = new Error(text || `OpenAI HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty OpenAI response');
  return JSON.parse(content);
}

export async function openaiVisionJson({ system, userParts, model }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('OPENAI_API_KEY is not set');
    err.code = 'NO_KEY';
    throw err;
  }
  const m = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: m,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: userParts,
        },
      ],
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    const e = new Error(text || `OpenAI HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty OpenAI response');
  return JSON.parse(content);
}
