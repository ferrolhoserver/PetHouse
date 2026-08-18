import { createPublicAuthClient, sendJson, setSessionCookies } from '../_lib/auth-server.js';

function redirect(response, location) {
  response.statusCode = 303;
  response.setHeader('Location', location);
  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.end();
}

export default async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Método não permitido.' }, { Allow: 'GET' });
  const url = new URL(request.url, `https://${request.headers.host}`);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') || '/';
  if (!tokenHash || !type || !['signup', 'recovery', 'email_change', 'magiclink'].includes(type)) {
    return redirect(response, '/?auth_error=invalid_link');
  }

  try {
    const client = createPublicAuthClient();
    const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error || !data?.session?.access_token || !data.session.refresh_token) {
      return redirect(response, '/?auth_error=expired_link');
    }
    setSessionCookies(response, data.session);
    const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
    return redirect(response, safeNext);
  } catch (error) {
    console.error('Erro ao confirmar token de autenticação:', error);
    return redirect(response, '/?auth_error=confirm_failed');
  }
}
