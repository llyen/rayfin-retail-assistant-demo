import { entity, role, text, date, uuid } from '@microsoft/rayfin-core';

/** Rozmowa z asystentem — widoczna tylko dla autora. */
@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class Conversation {
  @uuid() id!: string;
  @text({ min: 1, max: 200 }) title!: string;
  @text() user_id!: string;
  @date() createdAt!: Date;
  @date() updatedAt!: Date;
}
