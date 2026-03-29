import { openaiChatJson } from './lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { role, context = {}, messages = [] } = req.body || {};
    const convo = Array.isArray(messages)
      ? messages
          .filter(m => m && typeof m === 'object' && typeof m.content === 'string')
          .map(m => `${m.role || 'user'}: ${m.content}`)
          .slice(-10)
          .join('\n')
      : '';

    const system = `You are Credence, the classroom goal assistant inside the Credence platform.
You must:
- Use the provided user context to answer.
- Be helpful and non-judgmental.
- When giving suggestions, label them as suggestions and remind that instructors have final authority.
- Output strict JSON only with keys:
  reply (string, the assistant message),
  recommendations (array of strings, optional),
  atRisk (array of objects {name:string, reason:string}, optional),
  source (string: "openai").`;

    const user = `User role: ${role}
User context (JSON): ${JSON.stringify(context).slice(0, 4000)}

Conversation so far:
${convo}

Respond to the last user message.`;

    const out = await openaiChatJson({ system, user });
    return res.status(200).json({
      reply: out.reply || out.text || 'Credence is ready to help!',
      recommendations: Array.isArray(out.recommendations) ? out.recommendations : [],
      atRisk: Array.isArray(out.atRisk) ? out.atRisk : [],
      source: out.source || 'openai',
    });
  } catch (e) {
    if (e.code === 'NO_KEY') return res.status(503).json({ error: 'OPENAI_API_KEY not configured on server' });
    console.error('assistant-chat', e);
    return res.status(500).json({ error: e.message || 'Chat failed' });
  }
}

