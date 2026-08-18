import { authenticatedUser, clearSessionCookies, publicUser, sendJson, supabaseAuthFetch, validateOrigin } from '../_lib/auth-server.js';

export default async function handler(request, response) {
  if (request.method === 'GET') {
    try {
      const session = await authenticatedUser(request);
      return sendJson(response, 200, { authenticated: Boolean(session), user: publicUser(session?.user) });
    } catch (error) {
      if (error.code === 'AUTH_NOT_CONFIGURED') return sendJson(response, 200, { authenticated: false, configured: false });
      return sendJson(response, 200, { authenticated: false });
    }
  }

  if (request.method === 'DELETE') {
    if (!validateOrigin(request)) return sendJson(response, 403, { error: 'Origem inválida.' });
    try {
      const session = await authenticatedUser(request);
      if (session) await supabaseAuthFetch('/logout', { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}` } });
    } catch (_) {
      // Encerrar no cliente mesmo que a rede esteja indisponível.
    }
    clearSessionCookies(response);
    return sendJson(response, 200, { ok: true });
  }

  return sendJson(response, 405, { error: 'Método não permitido.' }, { Allow: 'GET, DELETE' });
}
