import { getRayfinClient } from './rayfinClient';
import { handleAuthError } from './errors';

export interface FeedbackItem {
  id: string;
  message_id: string;
  user_id: string;
  positive: boolean;
  comment: string;
  createdAt: Date;
}

export async function submitFeedback(
  messageId: string,
  positive: boolean,
  comment = ''
): Promise<FeedbackItem> {
  try {
    const client = getRayfinClient();
    const s = client.auth.getSession();
    if (!s.isAuthenticated || !s.user) throw new Error('Not authenticated');
    const fb = await client.data.Feedback.create({
      message_id: messageId,
      user_id: s.user.id,
      positive,
      comment: comment.slice(0, 2000),
      createdAt: new Date(),
    });
    return fb as FeedbackItem;
  } catch (e) {
    handleAuthError(e);
  }
}

export async function getFeedbackForMessage(messageId: string): Promise<FeedbackItem | null> {
  try {
    const res = (await getRayfinClient()
      .data.Feedback.select(['id', 'message_id', 'user_id', 'positive', 'comment', 'createdAt'])
      .where({ message_id: messageId })
      .orderBy({ createdAt: 'desc' })
      .execute()) as FeedbackItem[];
    return res[0] ?? null;
  } catch (e) {
    handleAuthError(e);
  }
}
