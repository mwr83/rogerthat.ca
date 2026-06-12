export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const { name, email, service, message } = body;

    // Basic validation
    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required.' }), {
        status: 400, headers,
      });
    }

    // Write to Airtable
    const airtableRes = await fetch(
      'https://api.airtable.com/v0/appKEcxnqwJqhA07m/tbl8WZP76c4GGi7ZL',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Name':         name,
            'Email':        email,
            'Service':      service || '',
            'Message':      message || '',
            'Submitted At': new Date().toISOString(),
          },
        }),
      }
    );

    if (!airtableRes.ok) {
      const err = await airtableRes.text();
      console.error('Airtable error:', err);
      return new Response(JSON.stringify({ error: 'Failed to save submission.' }), {
        status: 500, headers,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (err) {
    console.error('Worker error:', err);
    return new Response(JSON.stringify({ error: 'Server error.' }), {
      status: 500, headers,
    });
  }
}

// Handle preflight CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
