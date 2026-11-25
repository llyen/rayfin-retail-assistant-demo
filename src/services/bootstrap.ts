import { initRayfinClient } from './rayfinClient';

/**
 * Read VITE_* env vars (injected by `rayfin env --framework vite`) and
 * initialize the Rayfin client singleton.
 */
export async function bootstrapRayfin(): Promise<{ useFabric: boolean }> {
  const apiUrl = import.meta.env.VITE_RAYFIN_API_URL || 'http://localhost:5168';
  const publishableKey = import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY;
  const functionsBaseUrl = import.meta.env.VITE_RAYFIN_FUNCTIONS_URL;

  const apiHost = new URL(apiUrl).hostname;
  const useFabric = apiHost !== 'localhost' && apiHost !== '127.0.0.1';

  if (useFabric && !publishableKey) {
    throw new Error('VITE_RAYFIN_PUBLISHABLE_KEY is required for Fabric mode');
  }

  initRayfinClient({
    baseUrl: apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`,
    publishableKey: publishableKey ?? 'local-dev-key',
    functionsBaseUrl,
    localDev: !useFabric,
  });

  return { useFabric };
}
