import type { RetrievalHit } from './retrieval';
import { retrieve } from './retrieval';
import type { Citation } from './messages';

export interface AskResult {
  content: string;
  citations: Citation[];
  mode: 'azure-openai' | 'mock';
}

const SYSTEM_PROMPT = `Jesteś wewnętrznym asystentem RetailCo. Odpowiadasz po polsku, zwięźle i konkretnie.
Korzystaj WYŁĄCZNIE z dostarczonych fragmentów bazy wiedzy. Jeśli odpowiedzi tam nie ma,
powiedz wprost, że nie wiesz, i zaproponuj, kogo zapytać. Na końcu odpowiedzi wymień użyte
źródła w formacie: [1] Tytuł, [2] Tytuł.`;

function buildContext(hits: RetrievalHit[]): string {
  if (hits.length === 0) return '(brak dopasowanych dokumentów)';
  return hits
    .map(
      (h, i) =>
        `[${i + 1}] ${h.doc.title} (audience=${h.doc.audience}, region=${h.doc.region})\n${h.snippet}`
    )
    .join('\n\n---\n\n');
}

function envCfg() {
  return {
    endpoint: (import.meta.env.VITE_AZURE_OPENAI_ENDPOINT ?? '').replace(/\/$/, ''),
    key: import.meta.env.VITE_AZURE_OPENAI_KEY ?? '',
    deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT ?? '',
    apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION ?? '2024-10-21',
  };
}

async function callAzureOpenAI(question: string, hits: RetrievalHit[]): Promise<string> {
  const { endpoint, key, deployment, apiVersion } = envCfg();
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const body = {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Pytanie: ${question}\n\nKontekst:\n${buildContext(hits)}` },
    ],
    temperature: 0.2,
    max_tokens: 800,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Azure OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? '(pusta odpowiedź)';
}

function mockAnswer(question: string, hits: RetrievalHit[]): string {
  if (hits.length === 0) {
    return `Nie znalazłem w bazie wiedzy nic dopasowanego do pytania:\n„${question}"\n\nSpróbuj przeformułować pytanie albo dodaj odpowiedni dokument w zakładce „Baza wiedzy".`;
  }
  const lines = [
    `Na podstawie ${hits.length} dokumentu(ów) z bazy wiedzy:`,
    '',
    ...hits.map((h, i) => `[${i + 1}] **${h.doc.title}** — ${h.snippet}`),
    '',
    '_(odpowiedź z trybu MOCK — nie skonfigurowano Azure OpenAI; ustaw VITE_AZURE_OPENAI_* w .env.local)_',
  ];
  return lines.join('\n');
}

export async function ask(question: string): Promise<AskResult> {
  const hits = await retrieve(question, 4);
  const citations: Citation[] = hits.map((h) => ({ docId: h.doc.id, title: h.doc.title }));
  const cfg = envCfg();
  const canUseAzure = cfg.endpoint && cfg.key && cfg.deployment;

  if (canUseAzure) {
    try {
      const content = await callAzureOpenAI(question, hits);
      return { content, citations, mode: 'azure-openai' };
    } catch (err) {
      console.warn('Azure OpenAI failed, falling back to mock:', err);
    }
  }
  return { content: mockAnswer(question, hits), citations, mode: 'mock' };
}
