/* PetHouse V2 — utilitários para funções Vercel de autenticação */

import { createClient } from '@supabase/supabase-js';

const COOKIE_ACCESS = 'pethouse_access';
const COOKIE_REFRESH = 'pethouse_refresh';
const COOKIE_OPTIONS = 'Path=/; HttpOnly; Secure; SameSite=Lax';

export function getConfig() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    const error = new Error('Autenticação remota não configurada. Defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no ambiente de produção.');
    error.code = 'AUTH_NOT_CONFIGURED';
    throw error;
  }
  return { url: url.replace(/\/$/, ''), publishableKey };
}

export function parseCookies(request) {
  const source = request.headers.cookie || '';
  return Object.fromEntries(source.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const separator = part.indexOf('=');
    return separator === -1 ? [part, ''] : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
  }));
}

export async function getJsonBody(request) {
  if (typeof request.body === 'object' && request.body !== null) return request.body;
  if (typeof request.body !== 'string') return {};
  try { return JSON.parse(request.body); } catch (_) { return {}; }
}

export function sendJson(response, status, body, extraHeaders = {}) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.setHeader('Pragma', 'no-cache');
  Object.entries(extraHeaders).forEach(([name, value]) => response.setHeader(name, value));
  response.end(JSON.stringify(body));
}

export function validateOrigin(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch (_) { return false; }
}

export function setSessionCookies(response, session) {
  const accessMaxAge = Math.max(60, Number(session.expires_in || 3600));
  const refreshMaxAge = 60 * 60 * 24 * 30;
  response.setHeader('Set-Cookie', [
    `${COOKIE_ACCESS}=${encodeURIComponent(session.access_token)}; ${COOKIE_OPTIONS}; Max-Age=${accessMaxAge}`,
    `${COOKIE_REFRESH}=${encodeURIComponent(session.refresh_token)}; ${COOKIE_OPTIONS}; Max-Age=${refreshMaxAge}`
  ]);
}

export function clearSessionCookies(response) {
  response.setHeader('Set-Cookie', [
    `${COOKIE_ACCESS}=; ${COOKIE_OPTIONS}; Max-Age=0`,
    `${COOKIE_REFRESH}=; ${COOKIE_OPTIONS}; Max-Age=0`
  ]);
}

export async function supabaseAuthFetch(path, options = {}) {
  const { url, publishableKey } = getConfig();
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...options,
    headers: {
      apikey: publishableKey,
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = null; }
  return { response, data };
}

export async function authenticatedUser(request) {
  const cookies = parseCookies(request);
  const accessToken = cookies[COOKIE_ACCESS];
  if (!accessToken) return null;
  const { response, data } = await supabaseAuthFetch('/user', { headers: { Authorization: `Bearer ${accessToken}` } });
  return response.ok ? { user: data, accessToken } : null;
}

export function createPublicAuthClient() {
  const { url, publishableKey } = getConfig();
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

export async function createRequestAuthClient(request) {
  const { url, publishableKey } = getConfig();
  const client = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  const cookies = parseCookies(request);
  if (!cookies[COOKIE_ACCESS] || !cookies[COOKIE_REFRESH]) return { client, session: null };
  const { data, error } = await client.auth.setSession({
    access_token: cookies[COOKIE_ACCESS],
    refresh_token: cookies[COOKIE_REFRESH]
  });
  if (error || !data.session) return { client, session: null };
  return { client, session: data.session };
}

export function publicUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, emailConfirmedAt: user.email_confirmed_at || null, createdAt: user.created_at || null };
}
