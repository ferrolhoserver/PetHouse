import { createRequestAuthClient, getJsonBody, sendJson, setSessionCookies, validateOrigin } from '../_lib/auth-server.js';

function noSession(response) {
  return sendJson(response, 401, { error: 'Sessão indisponível. Entre novamente para continuar.' });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Método não permitido.' }, { Allow: 'POST' });
  if (!validateOrigin(request)) return sendJson(response, 403, { error: 'Origem inválida.' });

  try {
    const { client, session } = await createRequestAuthClient(request);
    if (!session) return noSession(response);
    const { action, factorId, challengeId, code, friendlyName } = await getJsonBody(request);

    if (action === 'status') {
      const [factors, assurance] = await Promise.all([
        client.auth.mfa.listFactors(),
        client.auth.mfa.getAuthenticatorAssuranceLevel()
      ]);
      if (factors.error || assurance.error) return sendJson(response, 502, { error: 'Não foi possível verificar o segundo fator.' });
      return sendJson(response, 200, {
        factors: (factors.data.totp || []).map(factor => ({ id: factor.id, status: factor.status, friendlyName: factor.friendly_name || 'Autenticador' })),
        currentLevel: assurance.data.currentLevel,
        nextLevel: assurance.data.nextLevel
      });
    }

    if (action === 'enroll') {
      const result = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: String(friendlyName || 'PetHouse').slice(0, 80) });
      if (result.error) return sendJson(response, 400, { error: 'Não foi possível iniciar o segundo fator.' });
      return sendJson(response, 200, {
        factor: { id: result.data.id, type: result.data.factor_type },
        totp: { qrCode: result.data.totp.qr_code, secret: result.data.totp.secret, uri: result.data.totp.uri }
      });
    }

    if (action === 'challenge') {
      const result = await client.auth.mfa.challenge({ factorId });
      if (result.error) return sendJson(response, 400, { error: 'Não foi possível criar o desafio de segurança.' });
      return sendJson(response, 200, { challengeId: result.data.id });
    }

    if (action === 'verify') {
      if (!/^\d{6,8}$/.test(String(code || ''))) return sendJson(response, 400, { error: 'Informe o código gerado pelo autenticador.' });
      const result = await client.auth.mfa.verify({ factorId, challengeId, code: String(code) });
      if (result.error || !result.data.session) return sendJson(response, 401, { error: 'Código de autenticação inválido ou expirado.' });
      setSessionCookies(response, result.data.session);
      return sendJson(response, 200, { ok: true, level: 'aal2' });
    }

    if (action === 'unenroll') {
      const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance.error || assurance.data.currentLevel !== 'aal2') return sendJson(response, 403, { error: 'Confirme o segundo fator antes de removê-lo.' });
      const result = await client.auth.mfa.unenroll({ factorId });
      if (result.error) return sendJson(response, 400, { error: 'Não foi possível remover o segundo fator.' });
      return sendJson(response, 200, { ok: true });
    }

    return sendJson(response, 400, { error: 'Ação de segurança inválida.' });
  } catch (error) {
    if (error.code === 'AUTH_NOT_CONFIGURED') return sendJson(response, 503, { error: error.message });
    console.error('Erro de MFA:', error);
    return sendJson(response, 500, { error: 'Não foi possível concluir a operação de segurança.' });
  }
}
