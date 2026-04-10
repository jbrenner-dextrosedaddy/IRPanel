// api/panel-survey.js
// Vercel serverless function — handles GET (fetch aggregated results) and POST (submit response)
// Place this file at: /api/panel-survey.js in your GitHub repo

import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

const TABLE = 'Panel Survey Responses';

// The 10 question keys and their answer options
const QUESTIONS = {
  q1:  ['Pre-med','MS1/MS2','MS3/MS4','Resident/Fellow','Attending/Other'],
  q2:  ['No access','Limited','Moderate','Strong','Very strong'],
  q3:  ['Clerkship','Social media','A mentor','Research','Conference'],
  q4:  ['Yes, formal','Yes, informal','No, looking','No, unsure'],
  q5:  ['No home IR program',"Don't know how to reach out",'Imposter syndrome','Time/geography','No barrier'],
  q6:  ['Yes, worked','Yes, no reply','No, intimidating',"No, didn't think to"],
  q7:  ['Instagram','X/Twitter','LinkedIn','None'],
  q8:  ['Very uncomfortable','Somewhat uncomfortable','Neutral','Comfortable','Very comfortable'],
  q9:  ['Career guidance','Research opportunities','Emotional support','Sponsorship','Clinical/technical advice'],
  q10: ['Regular check-ins','Research collaboration','Invested in my goals','Peer network','Social connection'],
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST: save a new survey response ──
  if (req.method === 'POST') {
    try {
      const body = req.body || {};

      await base(TABLE).create([{
        fields: {
          'Q1 Year in Training':         body.q1  || '',
          'Q2 IR Mentorship Access':     body.q2  || '',
          'Q3 How Learned About IR':     body.q3  || '',
          'Q4 Has IR Mentor':            body.q4  || '',
          'Q5 Biggest Barrier':          body.q5  || '',
          'Q6 Cold Outreach':            body.q6  || '',
          'Q7 Best Platform':            body.q7  || '',
          'Q8 Comfort Posting Online':   body.q8  || '',
          'Q9 Missing Mentorship Type':  body.q9  || '',
          'Q10 Long-Term Engagement':    body.q10 || '',
          'Submitted At':                new Date().toISOString(),
        }
      }]);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Survey POST error:', err);
      return res.status(500).json({ error: 'Failed to save response' });
    }
  }

  // ── GET: return aggregated results ──
  if (req.method === 'GET') {
    try {
      const records = await base(TABLE).select({ view: 'Grid view' }).all();
      const total = records.length;

      // Build tally: { q1: { 'Pre-med': 3, 'MS1/MS2': 5, ... }, q2: { ... }, ... }
      const tally = {};
      Object.keys(QUESTIONS).forEach(qKey => {
        tally[qKey] = {};
        QUESTIONS[qKey].forEach(opt => { tally[qKey][opt] = 0; });
      });

      const fieldMap = {
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

      records.forEach(rec => {
        Object.keys(fieldMap).forEach(qKey => {
          const val = rec.get(fieldMap[qKey]);
          if (val && tally[qKey][val] !== undefined) {
            tally[qKey][val]++;
          }
        });
      });

      return res.status(200).json({ total, results: tally });
    } catch (err) {
      console.error('Survey GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch results' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
