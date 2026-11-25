import { getRayfinClient } from './rayfinClient';
import { handleAuthError } from './errors';

export interface Citation {
  docId: string;
  title: string;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: Citation[];
  createdAt: Date;
}

const FIELDS = [
  'id',
  'conversation_id',
  'user_id',
  'role',
  'content',
  'citations',
  'createdAt',
] as const;

type RawMessage = Omit<MessageItem, 'role' | 'citations'> & {
  role: string;
  citations: string;
};

function parseCitations(raw: string): Citation[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Citation[]) : [];
  } catch {
    return [];
  }
}

function hydrate(m: RawMessage): MessageItem {
  return {
    ...m,
    role: (m.role as MessageItem['role']) || 'assistant',
    citations: parseCitations(m.citations),
  };
}

export async function listMessages(conversationId: string): Promise<MessageItem[]> {
  try {
    const res = (await getRayfinClient()
      .data.Message.select([...FIELDS])
      .where({ conversation_id: conversationId })
      .orderBy({ createdAt: 'asc' })
      .execute()) as RawMessage[];
    return res.map(hydrate);
  } catch (e) {
    handleAuthError(e);
  }
}

export async function appendMessage(
  conversationId: string,
  role: MessageItem['role'],
  content: string,
  citations: Citation[] = []
): Promise<MessageItem> {
  try {
    const client = getRayfinClient();
    const s = client.auth.getSession();
    if (!s.isAuthenticated || !s.user) throw new Error('Not authenticated');
    const msg = (await client.data.Message.create({
      conversation_id: conversationId,
      user_id: s.user.id,
      role,
      content,
      citations: JSON.stringify(citations),
      createdAt: new Date(),
    })) as RawMessage;
    return hydrate(msg);
  } catch (e) {
    handleAuthError(e);
  }
}
