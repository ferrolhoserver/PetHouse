import { createPublicAuthClient, getJsonBody, sendJson, validateOrigin } from '../_lib/auth-server.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Método não permitido.' }, { Allow: 'POST' });
  if (!validateOrigin(request)) return sendJson(response, 403, { error: 'Origem inválida.' });
  const { email } = await getJsonBody(request);
  if (!EMAIL_PATTERN.test(String(email || '').trim())) return sendJson(response, 400, { error: 'Informe um e-mail válido.' });

  try {
    const origin = `https://${request.headers.host}`;
    const client = createPublicAuthClient();
    await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${origin}/api/auth/confirm?next=/auth/reset`
    });
    // Resposta idêntica, independentemente da existência da conta.
    return sendJson(response, 202, { ok: true, message: 'Se houver uma conta para este endereço, você receberá instruções para redefinir a senha.' });
  } catch (error) {
    if (error.code === 'AUTH_NOT_CONFIGURED') return sendJson(response, 503, { error: error.message });
    console.error('Erro ao iniciar redefinição de senha:', error);
    return sendJson(response, 500, { error: 'Não foi possível iniciar a redefinição agora.' });
  }
}
