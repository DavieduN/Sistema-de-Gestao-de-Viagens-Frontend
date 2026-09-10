export function getPayloadToken(): any {
  const token = localStorage.getItem('sgv_token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isGestorLogado(): boolean {
  const payload = getPayloadToken();
  return payload?.cargo?.toUpperCase() === 'GESTOR';
}

export function getMatriculaLogada(): string {
  const payload = getPayloadToken();
  return payload?.sub || '';
}

export function logout(): void {
  localStorage.removeItem('sgv_token');
}