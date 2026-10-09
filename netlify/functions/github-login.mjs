import { CLIENT_ID, CLIENT_SECRET, GITHUB_WEB, SCOPE, siteOrigin, finish } from '../lib/github.mjs';

// Sends the visitor to GitHub, which asks if they allow Pip Playground to use their repositories.
export default async (req) => {
  if (!CLIENT_ID || !CLIENT_SECRET) return finish({ error: 'GitHub sign-in is not set up on this site yet. You can paste a token instead.' });
  const state = crypto.randomUUID().replace(/-/g, '');
  const auth = new URL(GITHUB_WEB + '/login/oauth/authorize');
  auth.searchParams.set('client_id', CLIENT_ID);
  auth.searchParams.set('redirect_uri', siteOrigin(req) + '/auth/github/callback');
  auth.searchParams.set('scope', SCOPE);
  auth.searchParams.set('state', state);
  auth.searchParams.set('allow_signup', 'true');
  return new Response(null, {
    status: 302,
    headers: {
      Location: auth.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': `pip_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`
    }
  });
};

export const config = { path: '/auth/github' };
