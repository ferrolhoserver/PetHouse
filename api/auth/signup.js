import { createPublicAuthClient, getJsonBody, sendJson, validateOrigin } from '../_lib/auth-server.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9\s]/.test(password);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Método não permitido.' }, { Allow: 'POST' });
  if (!validateOrigin(request)) return sendJson(response, 403, { error: 'Origem inválida.' });

  const { email, password } = await getJsonBody(request);
  if (!EMAIL_PATTERN.test(String(email || '').trim())) return sendJson(response, 400, { error: 'Informe um e-mail válido.' });
  if (!validatePassword(password)) return sendJson(response, 400, { error: 'A senha não atende à política de segurança.' });

  try {
    const origin = `https://${request.headers.host}`;
    const client = createPublicAuthClient();
    const { error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { application: 'pethouse' },
        emailRedirectTo: `${origin}/api/auth/confirm?next=/`
      }
    });

    // A mesma resposta evita revelar se um endereço já possui cadastro.
    if (error) {
      console.error('Falha no cadastro remoto:', error.message);
      return sendJson(response, 502, { error: 'Não foi possível iniciar a confirmação por e-mail. Tente novamente mais tarde.' });
    }
    return sendJson(response, 202, { ok: true, message: 'Se o endereço puder receber cadastro, enviaremos uma confirmação por e-mail.' });
  } catch (error) {
    if (error.code === 'AUTH_NOT_CONFIGURED') return sendJson(response, 503, { error: error.message });
    console.error('Erro inesperado no cadastro:', error);
    return sendJson(response, 500, { error: 'Não foi possível iniciar o cadastro.' });
  }
}
