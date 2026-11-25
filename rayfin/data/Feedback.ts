import { entity, role, text, date, uuid, boolean } from '@microsoft/rayfin-core';

/** Kciuk góra/dół + opcjonalny komentarz dla konkretnej odpowiedzi asystenta. */
@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class Feedback {
  @uuid() id!: string;
  @text() message_id!: string;
  @text() user_id!: string;
  @boolean() positive!: boolean;
  @text({ max: 2000 }) comment!: string;
  @date() createdAt!: Date;
}
