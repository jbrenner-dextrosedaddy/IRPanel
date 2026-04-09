export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const key = process.env.AIRTABLE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Use table ID directly instead of table name to avoid encoding issues
    const response = await fetch(
      'https://api.airtable.com/v0/appiAZADdImMMDYGa/tblC61JsMfEfRxXpo',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Name: name,
            Email: email,
            Role: role,
            'Submitted At': new Date().toISOString(),
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
