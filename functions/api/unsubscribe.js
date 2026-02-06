/**
 * Stray — Unsubscribe API
 * 
 * Handle unsubscribe requests.
 * GET /api/unsubscribe?email=xxx — Unsubscribe and redirect to confirmation page
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const email = url.searchParams.get('email')?.trim()?.toLowerCase();
  
  if (!email) {
    return Response.redirect('https://stray.space/unsubscribed.html?status=invalid', 302);
  }

  try {
    // Check if exists
    const existing = await env.SUBSCRIBERS.get(email);
    
    if (existing) {
      await env.SUBSCRIBERS.delete(email);
    }

    return Response.redirect('https://stray.space/unsubscribed.html?status=success', 302);

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return Response.redirect('https://stray.space/unsubscribed.html?status=error', 302);
  }
}
