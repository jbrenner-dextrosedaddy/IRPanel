export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, country, institution, role } = req.body;

  if (!firstName || !lastName || !email || !country || !institution || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(
      'https://api.airtable.com/v0/appiAZADdImMMDYGa/Global%20IR%20PPH%20Registry',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'First Name': firstName,
            'Last Name': lastName,
            'Email': email,
            'Country': country,
            'Institution / Hospital': institution,
            'Role': role,
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
