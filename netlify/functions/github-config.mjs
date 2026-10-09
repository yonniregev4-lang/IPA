import { CLIENT_ID, CLIENT_SECRET } from '../lib/github.mjs';

export default async () => new Response(JSON.stringify({ oauth: Boolean(CLIENT_ID && CLIENT_SECRET) }), {
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

export const config = { path: '/api/config' };
