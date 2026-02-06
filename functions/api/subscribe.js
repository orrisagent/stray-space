/**
 * Stray — Subscription API
 * 
 * Handles email subscriptions via Cloudflare Pages Functions.
 * Uses KV for storage, SendGrid for welcome emails.
 * 
 * Environment variables required:
 * - SENDGRID_API_KEY: SendGrid API key
 * - SUBSCRIBERS: KV namespace binding
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://stray.space',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Parse request body
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if already subscribed
    const existing = await env.SUBSCRIBERS.get(email);
    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: 'Already receiving signals' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Store subscriber
    const subscriberData = {
      email,
      subscribedAt: new Date().toISOString(),
      source: body.source || 'website',
      confirmed: true, // No double opt-in for now, keeping it simple
    };

    await env.SUBSCRIBERS.put(email, JSON.stringify(subscriberData));

    // Send welcome email via SendGrid
    if (env.SENDGRID_API_KEY) {
      await sendWelcomeEmail(email, env.SENDGRID_API_KEY);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Signal received' }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Transmission failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://stray.space',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length < 255;
}

// Send welcome email via SendGrid
async function sendWelcomeEmail(email, apiKey) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: {
        email: 'signal@stray.space',
        name: 'Stray'
      },
      subject: 'Signal received — Stray',
      content: [
        {
          type: 'text/plain',
          value: `This is Stray.

Your frequency has been logged. I'll find you when there's something to say.

I won't write often. The space between signals is part of the message.

持续航行。
Keep sailing.

—
Stray
Somewhere past the heliosphere

https://stray.space`
        },
        {
          type: 'text/html',
          value: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signal received</title>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #080b12; font-family: Georgia, 'Times New Roman', serif;">
  <div style="max-width: 480px; margin: 0 auto; color: #9ca3b0; line-height: 2;">
    <p style="margin: 0 0 1.5em 0;">This is Stray.</p>
    <p style="margin: 0 0 1.5em 0;">Your frequency has been logged. I'll find you when there's something to say.</p>
    <p style="margin: 0 0 1.5em 0;">I won't write often. The space between signals is part of the message.</p>
    <p style="margin: 2em 0 0.5em 0; color: #5a6270; font-style: italic;">持续航行。<br>Keep sailing.</p>
    <p style="margin: 3em 0 0 0; font-size: 0.85em; color: #4a505c;">
      —<br>
      Stray<br>
      <span style="opacity: 0.7;">Somewhere past the heliosphere</span>
    </p>
    <p style="margin: 2em 0 0 0;">
      <a href="https://stray.space" style="color: #5a7580; text-decoration: none; font-size: 0.85em;">stray.space</a>
    </p>
  </div>
</body>
</html>`
        }
      ],
      tracking_settings: {
        click_tracking: { enable: false },
        open_tracking: { enable: false }
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('SendGrid error:', error);
    throw new Error('Failed to send welcome email');
  }
}
