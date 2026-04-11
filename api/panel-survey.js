// api/panel-survey.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE = 'Panel Survey Responses';

const FIELD_MAP = {
  q1:  'Q1 Year in Training',
  q2:  'Q2 IR Mentorship Access',
  q3:  'Q3 How Learned About IR',
  q4:  'Q4 Has IR Mentor',
  q5:  'Q5 Biggest Barrier',
  q6:  'Q6 Cold Outreach',
  q7:  'Q7 Best Platform',
  q8:  'Q8 Comfort Posting Online',
  q9:  'Q9 Missing Mentorship Type',
  q10: 'Q10 Long-Term Engagement',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const records = await base(TABLE).select().all();
      const total = records.length;
      const results = {};

      records.forEach(r => {
        Object.keys(FIELD_MAP).forEach(qk => {
          const val = r.get(FIELD_MAP[qk]);
          if (!val) return;
          if (!results[qk]) results[qk] = {};
          // q7 may be comma-separated (multi-select)
          val.split(', ').forEach(v => {
            const trimmed = v.trim();
            if (trimmed) results[qk][trimmed] = (results[qk][trimmed] || 0) + 1;
          });
        });
      });

      return res.status(200).json({ total, results });
    } catch (err) {
      console.error('Survey GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const fields = { 'Submitted At': new Date().toISOString() };
      Object.keys(FIELD_MAP).forEach(qk => {
        if (body[qk]) fields[FIELD_MAP[qk]] = body[qk];
      });
      await base(TABLE).create([{ fields }]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Survey POST error:', err);
      return res.status(500).json({ error: 'Failed to save' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
