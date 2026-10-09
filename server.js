// Pip Playground server: serves the editor and handles "Connect with GitHub".
// No dependencies. Needs Node 18 or newer.
//
// Environment variables (set them in Render > your service > Environment):
//   GITHUB_CLIENT_ID      from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET  from your GitHub OAuth App
//   BASE_URL              optional, e.g. https://pip-playground.onrender.com
//                         (only needed if the callback URL GitHub sees is wrong)

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');
// TEMPORARY: keys written in the file. Move them to environment variables and generate a new secret later.
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liWbCUPns2eKaeNq';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '32b3bd34cdd9d63c1bc197596e2a9bc317328b61';
const GITHUB_WEB = (process.env.GITHUB_WEB_URL || 'https://github.com').replace(/\/$/, '');
const SCOPE = 'repo'; // read and write your repositories, needed to commit and turn on GitHub Pages

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function baseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim() || (req.socket.encrypted ? 'https' : 'http');
  return `${proto}://${req.headers.host}`;
}

function readCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

// After GitHub sends the user back, store the result in the browser and return to the editor.
// The token is never put in a URL.
function finish(res, data) {
  const payload = JSON.stringify(data).replace(/</g, '\\u003c');
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'Set-Cookie': 'pip_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
  });
  res.end(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Back to Pip…</title>
<style>body{margin:0;height:100vh;display:grid;place-items:center;background:#10121a;color:#e6e8f2;font:16px system-ui,sans-serif}</style></head>
<body><p>Going back to Pip…</p><script>
var d = ${payload};
try {
  if (d.token) { localStorage.setItem('pip:gh_token', JSON.stringify(d.token)); localStorage.removeItem('pip:gh_user'); }
  localStorage.setItem('pip:gh_result', JSON.stringify(d.error ? { error: d.error } : { ok: true }));
} catch (e) {}
location.replace('/');
</script></body></html>`);
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/config') {
    return sendJson(res, 200, { oauth: Boolean(CLIENT_ID && CLIENT_SECRET) });
  }

  if (url.pathname === '/auth/github') {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return finish(res, { error: 'GitHub sign-in is not set up on this server yet. The site owner needs to add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (see README). You can paste a token instead.' });
    }
    const state = crypto.randomBytes(16).toString('hex');
    const secure = baseUrl(req).startsWith('https');
    const auth = new URL(GITHUB_WEB + '/login/oauth/authorize');
    auth.searchParams.set('client_id', CLIENT_ID);
    auth.searchParams.set('redirect_uri', baseUrl(req) + '/auth/github/callback');
    auth.searchParams.set('scope', SCOPE);
    auth.searchParams.set('state', state);
    auth.searchParams.set('allow_signup', 'true');
    res.writeHead(302, {
      Location: auth.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': `pip_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
    });
    return res.end();
  }

  if (url.pathname === '/auth/github/callback') {
    const error = url.searchParams.get('error');
    if (error) {
      return finish(res, { error: error === 'access_denied' ? 'You cancelled the GitHub connection. Nothing was changed.' : 'GitHub said: ' + (url.searchParams.get('error_description') || error) });
    }
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state || state !== readCookies(req).pip_oauth_state) {
      return finish(res, { error: 'That sign-in link expired or came from somewhere else. Tap Connect with GitHub again.' });
    }
    try {
      const r = await fetch(GITHUB_WEB + '/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: baseUrl(req) + '/auth/github/callback' })
      });
      const data = await r.json();
      if (!data.access_token) return finish(res, { error: 'GitHub did not give Pip access: ' + (data.error_description || data.error || 'unknown error') });
      return finish(res, { token: data.access_token });
    } catch (e) {
      return finish(res, { error: "The server couldn't reach GitHub. Try again in a moment." });
    }
  }

  // static files from ./public
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = {
      'Content-Type': type,
      // versioned files never change, so browsers keep them for a year; everything else is checked each visit
      'Cache-Control': rel.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Accept-Encoding'
    };
    let body = buf;
    if (/text|javascript|json|svg|manifest/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      body = require('zlib').gzipSync(buf, { level: 9 });
      headers['Content-Encoding'] = 'gzip';
    }
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  });
}

http.createServer((req, res) => {
  handle(req, res).catch(() => { if (!res.headersSent) res.writeHead(500); res.end('Server error'); });
}).listen(PORT, () => {
  console.log(`Pip Playground is running on port ${PORT}`);
  if (!CLIENT_ID || !CLIENT_SECRET) console.log('GitHub sign-in is off: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to turn it on.');
});
