import { AuthError } from '@microsoft/rayfin-client';
import { getGlobalSessionExpiredHandler } from '../hooks/AuthContext';

export function handleAuthError(err: unknown): never {
  const isAuthError =
    err instanceof AuthError ||
    (err instanceof Error && 'status' in err && (err as { status: number }).status === 401);
  if (isAuthError) {
    const h = getGlobalSessionExpiredHandler();
    if (h) h();
  }
  throw err;
}
