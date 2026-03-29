import { openaiVisionJson } from './lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { imageBase64, note = '', mimeType = 'image/jpeg' } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 required (data URL or raw base64)' });
    }

    let dataUrl = imageBase64;
    if (!dataUrl.startsWith('data:')) {
      dataUrl = `data:${mimeType};base64,${imageBase64.replace(/^data:[^;]+;base64,/, '')}`;
    }

    const system = `You help instructors review student evidence photos for environmental / classroom goals.
Estimate how complete the submission looks relative to a typical successful submission.
Output strict JSON only:
estimatedPct (integer 0-100),
confidence (number 0-1, how sure you are),
relevance (short string: does this look related to sustainability / stated task?),
disclaimer (fixed string): "AI assist only — instructors retain final approval."`;

    const userParts = [
      {
        type: 'text',
        text: `Student notes (may be empty): ${String(note).slice(0, 2000)}`,
      },
      {
        type: 'image_url',
        image_url: { url: dataUrl },
      },
    ];

    const out = await openaiVisionJson({ system, userParts });
    const estimatedPct = Math.max(0, Math.min(100, Math.round(Number(out.estimatedPct) || 0)));
    const confidence = Math.max(0, Math.min(1, Number(out.confidence) || 0.5));

    return res.status(200).json({
      estimatedPct,
      confidence,
      relevance: String(out.relevance || 'Review suggested.'),
      disclaimer: out.disclaimer || 'AI assist only — instructors retain final approval.',
      source: 'openai',
    });
  } catch (e) {
    if (e.code === 'NO_KEY') {
      return res.status(503).json({ error: 'OPENAI_API_KEY not configured on server' });
    }
    console.error('analyze-evidence', e);
    return res.status(500).json({ error: e.message || 'Analysis failed' });
  }
}
