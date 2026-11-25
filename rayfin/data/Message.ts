import { entity, role, text, date, uuid } from '@microsoft/rayfin-core';

/**
 * Pojedyncza wiadomość w rozmowie.
 * Pole `citations` to JSON-serializowana tablica { docId, title } — MVP bez relacji.
 */
@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class Message {
  @uuid() id!: string;
  @text() conversation_id!: string;
  @text() user_id!: string;
  /** "user" | "assistant" | "system" */
  @text({ max: 16 }) role!: string;
  @text({ min: 1 }) content!: string;
  @text({ max: 4000 }) citations!: string;
  @date() createdAt!: Date;
}
