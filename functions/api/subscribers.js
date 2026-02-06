/**
 * Stray — Subscribers Admin API
 * 
 * List and manage subscribers (admin only).
 * Requires ADMIN_KEY environment variable for authentication.
 * 
 * GET /api/subscribers?key=ADMIN_KEY — List all subscribers
 * DELETE /api/subscribers?key=ADMIN_KEY&email=xxx — Unsubscribe
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Auth check
  const key = url.searchParams.get('key');
  if (!key || key !== env.ADMIN_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // List all subscribers from KV
    const list = await env.SUBSCRIBERS.list();
    const subscribers = [];

    for (const key of list.keys) {
      const data = await env.SUBSCRIBERS.get(key.name);
      if (data) {
        subscribers.push(JSON.parse(data));
      }
    }

    // Sort by subscription date (newest first)
    subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: subscribers.length,
        subscribers 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('List error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve subscribers' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Auth check
  const key = url.searchParams.get('key');
  if (!key || key !== env.ADMIN_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const email = url.searchParams.get('email')?.toLowerCase();
  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await env.SUBSCRIBERS.delete(email);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Unsubscribed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to unsubscribe' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
