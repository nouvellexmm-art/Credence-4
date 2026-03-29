import { openaiChatJson } from './lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { goalDescription = '' } = req.body || {};
    const system = `You support diverse learners. Rewrite the goal into clear numbered steps (3-5 steps), plain language, short sentences.
Output strict JSON: { "steps": "string with steps only, use \\n between steps" }`;

    const user = `Goal text:\n${String(goalDescription).slice(0, 4000)}`;

    const out = await openaiChatJson({ system, user });
    const steps = String(out.steps || out.text || '').slice(0, 4000);
    return res.status(200).json({
      steps,
      source: 'openai',
    });
  } catch (e) {
    if (e.code === 'NO_KEY') {
      return res.status(503).json({ error: 'OPENAI_API_KEY not configured on server' });
    }
    console.error('accessibility-help', e);
    return res.status(500).json({ error: e.message || 'Help generation failed' });
  }
}
