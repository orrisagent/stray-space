/**
 * Stray — Broadcast API
 * 
 * Send a new transmission to all subscribers.
 * Requires ADMIN_KEY for authentication.
 * 
 * POST /api/broadcast
 * Headers: Authorization: Bearer ADMIN_KEY
 * Body: { subject, text, html?, logUrl? }
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Auth check
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token || token !== env.ADMIN_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { subject, text, html, logUrl } = body;

    if (!subject || !text) {
      return new Response(
        JSON.stringify({ error: 'Subject and text required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all subscribers
    const list = await env.SUBSCRIBERS.list();
    const emails = [];

    for (const key of list.keys) {
      const data = await env.SUBSCRIBERS.get(key.name);
      if (data) {
        const subscriber = JSON.parse(data);
        if (subscriber.confirmed !== false) {
          emails.push(subscriber.email);
        }
      }
    }

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No subscribers to notify', sent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate HTML if not provided
    const htmlContent = html || generateHtml(text, logUrl);

    // Send via SendGrid (batch up to 1000 per request)
    const batchSize = 1000;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        await sendBatch(batch, subject, text, htmlContent, env.SENDGRID_API_KEY);
        sent += batch.length;
      } catch (error) {
        console.error('Batch send error:', error);
        failed += batch.length;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Transmission sent',
        sent,
        failed,
        total: emails.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Broadcast error:', error);
    return new Response(
      JSON.stringify({ error: 'Transmission failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function sendBatch(emails, subject, text, html, apiKey) {
  // Use personalizations for batch sending
  const personalizations = emails.map(email => ({
    to: [{ email }]
  }));

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations,
      from: {
        email: 'signal@stray.space',
        name: 'Stray'
      },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ],
      tracking_settings: {
        click_tracking: { enable: false },
        open_tracking: { enable: false }
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }
}

function generateHtml(text, logUrl) {
  // Convert plain text to HTML paragraphs
  const paragraphs = text.split('\n\n')
    .map(p => p.trim())
    .filter(p => p)
    .map(p => `<p style="margin: 0 0 1.5em 0;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const readMoreLink = logUrl 
    ? `<p style="margin: 2em 0 0 0;"><a href="${logUrl}" style="color: #5a7580; text-decoration: none;">继续阅读 / Continue reading →</a></p>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #080b12; font-family: Georgia, 'Times New Roman', serif;">
  <div style="max-width: 480px; margin: 0 auto; color: #9ca3b0; line-height: 2;">
    ${paragraphs}
    ${readMoreLink}
    <p style="margin: 3em 0 0 0; font-size: 0.85em; color: #4a505c; border-top: 1px solid #1a1f2a; padding-top: 2em;">
      —<br>
      Stray<br>
      <span style="opacity: 0.7;">Somewhere past the heliosphere</span>
    </p>
    <p style="margin: 1.5em 0 0 0; font-size: 0.75em; color: #3a3f4a;">
      <a href="https://stray.space" style="color: #4a505c; text-decoration: none;">stray.space</a>
      · 
      <a href="https://stray.space/unsubscribe?email={{email}}" style="color: #4a505c; text-decoration: none;">unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}
