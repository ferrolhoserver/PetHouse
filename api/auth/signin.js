import { createPublicAuthClient, getJsonBody, sendJson, setSessionCookies, validateOrigin } from '../_lib/auth-server.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Método não permitido.' }, { Allow: 'POST' });
  if (!validateOrigin(request)) return sendJson(response, 403, { error: 'Origem inválida.' });

  const { email, password } = await getJsonBody(request);
  if (!email || !password) return sendJson(response, 400, { error: 'Informe e-mail e senha.' });

  try {
    const client = createPublicAuthClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password
    });
    if (error || !data?.session?.access_token || !data.session.refresh_token) {
      return sendJson(response, 401, { error: 'E-mail ou senha inválidos.' });
    }
    setSessionCookies(response, data.session);
    return sendJson(response, 200, {
      ok: true,
      user: { id: data.user?.id || null, email: data.user?.email || null },
      mfaRequired: true
    });
  } catch (error) {
    if (error.code === 'AUTH_NOT_CONFIGURED') return sendJson(response, 503, { error: error.message });
    console.error('Erro de entrada:', error);
    return sendJson(response, 500, { error: 'Não foi possível iniciar a sessão.' });
  }
}
