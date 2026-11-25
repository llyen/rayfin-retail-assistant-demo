import { getRayfinClient } from './rayfinClient';
import { handleAuthError } from './errors';

export interface KnowledgeDocItem {
  id: string;
  title: string;
  body: string;
  tags: string;
  audience: string;
  region: string;
  author_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const FIELDS = [
  'id',
  'title',
  'body',
  'tags',
  'audience',
  'region',
  'author_id',
  'createdAt',
  'updatedAt',
] as const;

export async function listDocs(): Promise<KnowledgeDocItem[]> {
  try {
    const res = await getRayfinClient()
      .data.KnowledgeDoc.select([...FIELDS])
      .orderBy({ updatedAt: 'desc' })
      .execute();
    return res as KnowledgeDocItem[];
  } catch (e) {
    handleAuthError(e);
  }
}

export async function createDoc(
  input: Pick<KnowledgeDocItem, 'title' | 'body' | 'tags' | 'audience' | 'region'>
): Promise<KnowledgeDocItem> {
  try {
    const client = getRayfinClient();
    const s = client.auth.getSession();
    if (!s.isAuthenticated || !s.user) throw new Error('Not authenticated');
    const now = new Date();
    const doc = await client.data.KnowledgeDoc.create({
      ...input,
      author_id: s.user.id,
      createdAt: now,
      updatedAt: now,
    });
    return doc as KnowledgeDocItem;
  } catch (e) {
    handleAuthError(e);
  }
}

export async function updateDoc(
  id: string,
  updates: Partial<Pick<KnowledgeDocItem, 'title' | 'body' | 'tags' | 'audience' | 'region'>>
): Promise<void> {
  try {
    await getRayfinClient().data.KnowledgeDoc.update(
      { id },
      { ...updates, updatedAt: new Date() }
    );
  } catch (e) {
    handleAuthError(e);
  }
}

export async function deleteDoc(id: string): Promise<void> {
  try {
    await getRayfinClient().data.KnowledgeDoc.delete({ id });
  } catch (e) {
    handleAuthError(e);
  }
}
