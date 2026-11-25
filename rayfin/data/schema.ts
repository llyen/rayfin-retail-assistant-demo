import { KnowledgeDoc } from './KnowledgeDoc.js';
import { Conversation } from './Conversation.js';
import { Message } from './Message.js';
import { Feedback } from './Feedback.js';

export type AskRetailCoSchema = {
  KnowledgeDoc: KnowledgeDoc;
  Conversation: Conversation;
  Message: Message;
  Feedback: Feedback;
};

export const schema = [KnowledgeDoc, Conversation, Message, Feedback];
