/**
 * Stray — Worker Entry Point
 * Handles API routes, static assets served by ASSETS binding
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Debug logging
    console.log(`[Stray] ${request.method} ${url.pathname}`);
    
    // API Routes - handle before assets
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }
    
    // Static assets
    return env.ASSETS.fetch(request);
  }
};

async function handleAPI(request, env, url) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Check if KV is bound
    if (!env.SUBSCRIBERS) {
      console.error('[Stray] SUBSCRIBERS KV namespace not bound');
      return new Response(
        JSON.stringify({ success: false, error: 'Service not configured' }),
        { status: 503, headers: corsHeaders }
      );
    }

    // POST /api/subscribe
    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env, corsHeaders);
    }
    
    // GET /api/unsubscribe
    if (url.pathname === '/api/unsubscribe' && request.method === 'GET') {
      return handleUnsubscribe(request, env, url);
    }
    
    // GET /api/subscribers (admin)
    if (url.pathname === '/api/subscribers' && request.method === 'GET') {
      return handleListSubscribers(request, env, url, corsHeaders);
    }
    
    // DELETE /api/subscribers (admin)
    if (url.pathname === '/api/subscribers' && request.method === 'DELETE') {
      return handleDeleteSubscriber(request, env, url, corsHeaders);
    }
    
    // POST /api/broadcast (admin)
    if (url.pathname === '/api/broadcast' && request.method === 'POST') {
      return handleBroadcast(request, env, corsHeaders);
    }

    // Unknown API route
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Stray] API Error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============ Subscribe ============
async function handleSubscribe(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request body' }),
      { status: 400, headers: corsHeaders }
    );
  }
  
  const email = body.email?.trim()?.toLowerCase();

  if (!email || !isValidEmail(email)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid email' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const existing = await env.SUBSCRIBERS.get(email);
    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: 'Already subscribed' }),
        { status: 200, headers: corsHeaders }
      );
    }

    await env.SUBSCRIBERS.put(email, JSON.stringify({
      email,
      subscribedAt: new Date().toISOString(),
      source: body.source || 'website',
    }));

    // Send welcome email
    if (env.SENDGRID_API_KEY) {
      try {
        await sendWelcomeEmail(email, env.SENDGRID_API_KEY);
      } catch (e) {
        console.error('[Stray] Email send error:', e.message);
        // Don't fail the subscription if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Signal received' }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Stray] Subscribe error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: 'Subscription failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============ Unsubscribe ============
async function handleUnsubscribe(request, env, url) {
  const email = url.searchParams.get('email')?.trim()?.toLowerCase();
  
  if (!email) {
    return Response.redirect('https://stray.space/unsubscribed.html?status=invalid', 302);
  }

  try {
    await env.SUBSCRIBERS.delete(email);
    return Response.redirect('https://stray.space/unsubscribed.html?status=success', 302);
  } catch (e) {
    return Response.redirect('https://stray.space/unsubscribed.html?status=error', 302);
  }
}

// ============ List Subscribers (Admin) ============
async function handleListSubscribers(request, env, url, corsHeaders) {
  const key = url.searchParams.get('key');
  if (!key || key !== env.ADMIN_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const list = await env.SUBSCRIBERS.list();
  const subscribers = [];

  for (const k of list.keys) {
    const data = await env.SUBSCRIBERS.get(k.name);
    if (data) subscribers.push(JSON.parse(data));
  }

  subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));

  return new Response(
    JSON.stringify({ success: true, count: subscribers.length, subscribers }),
    { status: 200, headers: corsHeaders }
  );
}

// ============ Delete Subscriber (Admin) ============
async function handleDeleteSubscriber(request, env, url, corsHeaders) {
  const key = url.searchParams.get('key');
  if (!key || key !== env.ADMIN_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const email = url.searchParams.get('email')?.toLowerCase();
  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email required' }),
      { status: 400, headers: corsHeaders }
    );
  }

  await env.SUBSCRIBERS.delete(email);
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
}

// ============ Broadcast (Admin) ============
async function handleBroadcast(request, env, corsHeaders) {
  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth || auth !== env.ADMIN_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const { subject, text, html, logUrl } = await request.json();
  if (!subject || !text) {
    return new Response(
      JSON.stringify({ error: 'Subject and text required' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const list = await env.SUBSCRIBERS.list();
  const emails = [];
  for (const k of list.keys) {
    const data = await env.SUBSCRIBERS.get(k.name);
    if (data) emails.push(JSON.parse(data).email);
  }

  if (emails.length === 0) {
    return new Response(
      JSON.stringify({ success: true, sent: 0 }),
      { status: 200, headers: corsHeaders }
    );
  }

  const htmlContent = html || generateEmailHtml(text, logUrl);
  let sent = 0;

  for (let i = 0; i < emails.length; i += 1000) {
    const batch = emails.slice(i, i + 1000);
    try {
      await sendBatch(batch, subject, text, htmlContent, env.SENDGRID_API_KEY);
      sent += batch.length;
    } catch (e) {
      console.error('[Stray] Batch error:', e.message);
    }
  }

  return new Response(
    JSON.stringify({ success: true, sent, total: emails.length }),
    { status: 200, headers: corsHeaders }
  );
}

// ============ Helpers ============
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 255;
}

async function sendWelcomeEmail(email, apiKey) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: 'signal@stray.space', name: 'Stray' },
      subject: 'Signal received',
      content: [
        {
          type: 'text/plain',
          value: `This is Stray.\n\nYour frequency has been logged. I'll find you when there's something to say.\n\nI won't write often. The space between signals is part of the message.\n\n—\nStray\nhttps://stray.space`
        },
        {
          type: 'text/html',
          value: `<div style="max-width:480px;margin:0 auto;padding:40px 20px;background:#080b12;color:#9ca3b0;font-family:Georgia,serif;line-height:2"><p>This is Stray.</p><p>Your frequency has been logged. I'll find you when there's something to say.</p><p>I won't write often. The space between signals is part of the message.</p><p style="margin-top:3em;font-size:0.85em;color:#4a505c">—<br>Stray<br><a href="https://stray.space" style="color:#5a7580">stray.space</a></p></div>`
        }
      ],
      tracking_settings: { click_tracking: { enable: false }, open_tracking: { enable: false } }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`SendGrid error: ${response.status}`);
  }
}

async function sendBatch(emails, subject, text, html, apiKey) {
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: emails.map(e => ({ to: [{ email: e }] })),
      from: { email: 'signal@stray.space', name: 'Stray' },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ],
      tracking_settings: { click_tracking: { enable: false }, open_tracking: { enable: false } }
    }),
  });
}

function generateEmailHtml(text, logUrl) {
  const paragraphs = text.split('\n\n').filter(p => p.trim()).map(p => 
    `<p style="margin:0 0 1.5em">${p.replace(/\n/g, '<br>')}</p>`
  ).join('');
  const link = logUrl ? `<p style="margin:2em 0"><a href="${logUrl}" style="color:#5a7580">Continue reading →</a></p>` : '';
  return `<div style="max-width:480px;margin:0 auto;padding:40px 20px;background:#080b12;color:#9ca3b0;font-family:Georgia,serif;line-height:2">${paragraphs}${link}<p style="margin-top:3em;font-size:0.85em;color:#4a505c;border-top:1px solid #1a1f2a;padding-top:2em">—<br>Stray<br><a href="https://stray.space" style="color:#4a505c">stray.space</a></p></div>`;
}
