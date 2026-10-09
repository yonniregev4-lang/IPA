// Shared code for the "Connect with GitHub" Netlify Functions.
// These run on Netlify's servers, never in the visitor's browser.

// TEMPORARY: keys written in the file. Later, add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
// in Netlify (Site configuration > Environment variables), delete the two strings below,
// and generate a new client secret on GitHub.
export const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liWbCUPns2eKaeNq';
export const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '32b3bd34cdd9d63c1bc197596e2a9bc317328b61';

export const GITHUB_WEB = (process.env.GITHUB_WEB_URL || 'https://github.com').replace(/\/$/, '');
export const SCOPE = 'repo'; // read and write your repositories, needed to commit and turn on GitHub Pages

export function siteOrigin(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  const u = new URL(req.url);
  const proto = (req.headers.get('x-forwarded-proto') || u.protocol.replace(':', '')).split(',')[0].trim();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || u.host;
  return `${proto}://${host}`;
}

export function readCookie(req, name) {
  for (const part of (req.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

// Stores the result in the browser and goes back to the editor. The token never appears in a URL.
export function finish(data) {
  const payload = JSON.stringify(data).replace(/</g, '\\u003c');
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Back to Pip…</title>
<style>body{margin:0;height:100vh;display:grid;place-items:center;background:#10121a;color:#e6e8f2;font:16px system-ui,sans-serif}</style></head>
<body><p>Going back to Pip…</p><script>
var d = ${payload};
try {
  if (d.token) { localStorage.setItem('pip:gh_token', JSON.stringify(d.token)); localStorage.removeItem('pip:gh_user'); }
  localStorage.setItem('pip:gh_result', JSON.stringify(d.error ? { error: d.error } : { ok: true }));
} catch (e) {}
location.replace('/');
</script></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'Set-Cookie': 'pip_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'
    }
  });
}
