import { entity, role, text, date, uuid } from '@microsoft/rayfin-core';

/**
 * Dokument bazy wiedzy (procedura, polityka, instrukcja merchandisingowa, FAQ).
 * Każdy zalogowany pracownik może czytać. Edycja/usuwanie tylko dla autora
 * (uproszczenie MVP — docelowo dodać rolę 'editor' / RLS per region).
 */
@entity()
@role('authenticated', ['read', 'create'], {})
@role('authenticated', ['update', 'delete'], {
  policy: (claims, item) => claims.sub.eq(item.author_id),
})
export class KnowledgeDoc {
  @uuid() id!: string;
  @text({ min: 1, max: 200 }) title!: string;
  @text({ min: 1 }) body!: string;
  /** CSV tagów, np. "hr,urlopy". Trzymamy płasko — MVP. */
  @text({ max: 500 }) tags!: string;
  /** "store" | "hq" | "manager" | "all" — kto powinien widzieć w wynikach. */
  @text({ max: 32 }) audience!: string;
  /** np. "north", "south", "all". */
  @text({ max: 16 }) region!: string;
  @text() author_id!: string;
  @date() createdAt!: Date;
  @date() updatedAt!: Date;
}
