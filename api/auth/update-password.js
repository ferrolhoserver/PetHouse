import { createRequestAuthClient, getJsonBody, sendJson, validateOrigin } from '../_lib/auth-server.js';

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9\s]/.test(password);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Método não permitido.' }, { Allow: 'POST' });
  if (!validateOrigin(request)) return sendJson(response, 403, { error: 'Origem inválida.' });
  const { client, session } = await createRequestAuthClient(request);
  if (!session) return sendJson(response, 401, { error: 'Sessão de recuperação expirada. Solicite um novo link.' });
  const { password } = await getJsonBody(request);
  if (!validatePassword(password)) return sendJson(response, 400, { error: 'A senha não atende à política de segurança.' });

  try {
    const { error } = await client.auth.updateUser({ password });
    if (error) return sendJson(response, 502, { error: 'Não foi possível atualizar a senha. Solicite um novo link de recuperação.' });
    return sendJson(response, 200, { ok: true, message: 'Senha da conta atualizada. Para abrir um cofre em novo aparelho, use também o kit de recuperação.' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return sendJson(response, 500, { error: 'Não foi possível atualizar a senha.' });
  }
}
