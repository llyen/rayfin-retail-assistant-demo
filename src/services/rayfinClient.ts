import { RayfinClient } from '@microsoft/rayfin-client';
import type { AskRetailCoSchema } from '../../rayfin/data/schema';

export interface RayfinClientConfig {
  baseUrl: string;
  publishableKey: string;
  functionsBaseUrl?: string;
  /** True if backend points at localhost (controls Fabric vs password UI flow). */
  localDev: boolean;
}

let client: RayfinClient<AskRetailCoSchema> | null = null;
let localDev = false;

export function initRayfinClient(config: RayfinClientConfig): RayfinClient<AskRetailCoSchema> {
  if (client) return client;
  client = new RayfinClient<AskRetailCoSchema>({
    baseUrl: config.baseUrl,
    publishableKey: config.publishableKey,
    functionsBaseUrl: config.functionsBaseUrl,
    useProxy: false,
    authStorage: true,
  });
  localDev = config.localDev;
  return client;
}

export function getRayfinClient(): RayfinClient<AskRetailCoSchema> {
  if (!client) {
    throw new Error('Rayfin client not initialized. Call bootstrapRayfin() first.');
  }
  return client;
}

export function isLocalBackend(): boolean {
  return localDev;
}
