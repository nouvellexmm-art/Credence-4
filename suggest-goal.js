import { openaiChatJson } from './lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { points = 0, goals = [], hubs = [] } = req.body || {};
    const active = Array.isArray(goals) ? goals.filter((g) => g.state === 'active') : [];
    const summary = {
      points,
      activeGoalCount: active.length,
      avgProgress:
        active.length > 0
          ? Math.round(active.reduce((a, g) => a + (Number(g.progress) || 0), 0) / active.length)
          : null,
      hubNames: (hubs || []).slice(0, 8).map((h) => h.name),
      goalTitles: active.slice(0, 8).map((g) => ({ title: g.title, progress: g.progress, difficulty: g.difficulty })),
    };

    const system = `You are an assistant for Credence, a classroom goal-tracking app for sustainability education.
Suggest ONE weekly goal for a student. Output strict JSON only with keys:
title (string, short),
desc (string, 1-3 sentences, concrete),
difficulty (one of: Easy, Medium, Hard),
basis (string explaining why this fits their data — transparent for teachers).
Goals should be achievable but slightly challenging. Do not invent private data.`;

    const user = `Student context (aggregated): ${JSON.stringify(summary)}`;

    const out = await openaiChatJson({ system, user });
    const difficulty = ['Easy', 'Medium', 'Hard'].includes(out.difficulty) ? out.difficulty : 'Medium';
    return res.status(200).json({
      title: String(out.title || 'Weekly goal suggestion').slice(0, 200),
      desc: String(out.desc || '').slice(0, 800),
      difficulty,
      basis: String(out.basis || 'Model suggestion').slice(0, 600),
      source: 'openai',
    });
  } catch (e) {
    if (e.code === 'NO_KEY') {
      return res.status(503).json({ error: 'OPENAI_API_KEY not configured on server' });
    }
    console.error('suggest-goal', e);
    return res.status(500).json({ error: e.message || 'Suggestion failed' });
  }
}
