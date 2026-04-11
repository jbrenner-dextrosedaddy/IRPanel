// api/panel-questions.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE = 'Panel Questions';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const records = await base(TABLE).select({
        sort: [{ field: 'Submitted At', direction: 'asc' }]
      }).all();

      const questions = records.map(r => ({
        id: r.id,
        question: r.get('Question') || '',
        name: r.get('Name') || 'Anonymous',
        anonymous: r.get('Anonymous') || false,
        submittedAt: r.get('Submitted At') || '',
      })).filter(q => q.question);

      return res.status(200).json({ questions });
    } catch (err) {
      console.error('GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { question, name, anonymous } = req.body || {};
      if (!question) return res.status(400).json({ error: 'Question required' });
      await base(TABLE).create([{ fields: {
        'Question':     question,
        'Name':         anonymous ? 'Anonymous' : (name || 'Anonymous'),
        'Anonymous':    !!anonymous,
        'Submitted At': new Date().toISOString(),
      }}]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('POST error:', err);
      return res.status(500).json({ error: 'Failed to save' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
