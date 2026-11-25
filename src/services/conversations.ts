import { getRayfinClient } from './rayfinClient';
import { handleAuthError } from './errors';

export interface ConversationItem {
  id: string;
  title: string;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const FIELDS = ['id', 'title', 'user_id', 'createdAt', 'updatedAt'] as const;

export async function listConversations(): Promise<ConversationItem[]> {
  try {
    const res = await getRayfinClient()
      .data.Conversation.select([...FIELDS])
      .orderBy({ updatedAt: 'desc' })
      .execute();
    return res as ConversationItem[];
  } catch (e) {
    handleAuthError(e);
  }
}

export async function createConversation(title: string): Promise<ConversationItem> {
  try {
    const client = getRayfinClient();
    const s = client.auth.getSession();
    if (!s.isAuthenticated || !s.user) throw new Error('Not authenticated');
    const now = new Date();
    const conv = await client.data.Conversation.create({
      title: title.slice(0, 200),
      user_id: s.user.id,
      createdAt: now,
      updatedAt: now,
    });
    return conv as ConversationItem;
  } catch (e) {
    handleAuthError(e);
  }
}

export async function touchConversation(id: string): Promise<void> {
  try {
    await getRayfinClient().data.Conversation.update({ id }, { updatedAt: new Date() });
  } catch (e) {
    handleAuthError(e);
  }
}

export async function renameConversation(id: string, title: string): Promise<void> {
  try {
    await getRayfinClient().data.Conversation.update(
      { id },
      { title: title.slice(0, 200), updatedAt: new Date() }
    );
  } catch (e) {
    handleAuthError(e);
  }
}
