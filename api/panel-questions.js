export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, name, anonymous } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const response = await fetch(
      'https://api.airtable.com/v0/appiAZADdImMMDYGa/Panel%20Questions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Question: question.trim(),
            Name: anonymous ? 'Anonymous' : (name || 'Anonymous'),
            Anonymous: anonymous || false,
            'Submitted At': new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
