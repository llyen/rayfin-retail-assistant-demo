import type { KnowledgeDocItem } from './knowledge';
import { listDocs } from './knowledge';

/**
 * Bardzo prosty BM25-lite retrieval po stronie klienta.
 * MVP — docelowo zastąpić Fabric semantic/hybrid search po stronie Rayfin Functions.
 */

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ąćęłńóśźż\s]/giu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function score(query: string[], doc: KnowledgeDocItem): number {
  const haystack = `${doc.title} ${doc.tags} ${doc.body}`.toLowerCase();
  let s = 0;
  for (const q of query) {
    if (!q) continue;
    const occurrences = haystack.split(q).length - 1;
    if (occurrences === 0) continue;
    s += Math.log(1 + occurrences);
    if (doc.title.toLowerCase().includes(q)) s += 2;
    if (doc.tags.toLowerCase().includes(q)) s += 1;
  }
  return s;
}

export interface RetrievalHit {
  doc: KnowledgeDocItem;
  score: number;
  snippet: string;
}

function makeSnippet(body: string, query: string[]): string {
  const lower = body.toLowerCase();
  for (const q of query) {
    const idx = lower.indexOf(q);
    if (idx >= 0) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(body.length, idx + 200);
      return (start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '');
    }
  }
  return body.slice(0, 240) + (body.length > 240 ? '…' : '');
}

export async function retrieve(query: string, topK = 4): Promise<RetrievalHit[]> {
  const docs = await listDocs();
  const tokens = tokenize(query);
  if (tokens.length === 0 || docs.length === 0) return [];
  return docs
    .map((doc) => ({ doc, score: score(tokens, doc), snippet: makeSnippet(doc.body, tokens) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
