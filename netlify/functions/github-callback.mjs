import { CLIENT_ID, CLIENT_SECRET, GITHUB_WEB, siteOrigin, readCookie, finish } from '../lib/github.mjs';

// GitHub sends the visitor back here. Swap the one-time code for an access token, then return to the editor.
export default async (req) => {
  const url = new URL(req.url);
  const error = url.searchParams.get('error');
  if (error) {
    return finish({ error: error === 'access_denied' ? 'You cancelled the GitHub connection. Nothing was changed.' : 'GitHub said: ' + (url.searchParams.get('error_description') || error) });
  }
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || state !== readCookie(req, 'pip_oauth_state')) {
    return finish({ error: 'That sign-in link expired or came from somewhere else. Tap Connect with GitHub again.' });
  }
  try {
    const r = await fetch(GITHUB_WEB + '/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: siteOrigin(req) + '/auth/github/callback' })
    });
    const data = await r.json();
    if (!data.access_token) return finish({ error: 'GitHub did not give Pip access: ' + (data.error_description || data.error || 'unknown error') });
    return finish({ token: data.access_token });
  } catch (e) {
    return finish({ error: "Netlify couldn't reach GitHub. Try again in a moment." });
  }
};

export const config = { path: '/auth/github/callback' };
