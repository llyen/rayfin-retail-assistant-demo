# Ask RetailCo — wewnętrzny asystent (Rayfin demo)

Wersja angielska: [README.en.md](README.en.md).

Aplikacja typu "Ask Me Anything" dla pracowników RetailCo, fikcyjnej sieci marketów budowlano-ogrodniczych (sklep, kierownik, centrala),
zbudowana na **Microsoft Rayfin** (Backend-as-a-Service na Microsoft Fabric).

- Auth: email/hasło (lokalnie) lub Microsoft Entra SSO (Fabric).
- Encje (`rayfin/data/`): `KnowledgeDoc`, `Conversation`, `Message`, `Feedback`.
- RLS: każdy zalogowany czyta bazę wiedzy; rozmowy i feedback widzi tylko autor.
- RAG: keyword search po `KnowledgeDoc` (client-side BM25-lite), z hookiem do
  wymiany na hybrid search w OneLake (Rayfin Functions — TODO).
- LLM: Azure OpenAI (jeśli skonfigurowane w `.env.local`); w przeciwnym razie
  deterministyczny **mock** zwracający fragmenty bazy wiedzy.

## Stos

React 19 + Vite 7 + TailwindCSS v4, TypeScript, `@microsoft/rayfin-client`.

## Szybki start (lokalnie, bez Fabric)

Wymagania: Node 20+, Docker Desktop (do `rayfin dev`).

```bash
npm install
cp .env.example .env.local          # opcjonalnie wpisz klucze Azure OpenAI
npm run rayfin:db                   # pierwsza migracja schematu (uruchomi też kontenery)
npm run dev:local                   # backend w Dockerze + Vite na http://localhost:5173
```

Pierwsze logowanie: dowolny email + hasło (Rayfin tworzy konto w trybie
`password.enabled: true`). Po zalogowaniu aplikacja **auto-seeduje** 5
przykładowych dokumentów (urlopy, ekspozycja sezonowa, strój roboczy, BHP, otwarcie sklepu).

### Stop / czyszczenie

```bash
npm run dev:local:stop      # zatrzymaj kontenery (dane zostają)
npm run dev:local:down      # usuń kontenery (volumes zostają)
npm run dev:local:purge     # pełny reset
```

## Deploy na Microsoft Fabric

```bash
npm run up                  # rayfin up — provisioning + deploy
```

Wymaga workspace Fabric i zalogowania CLI. Po wdrożeniu:
- dane (KnowledgeDoc, Conversation, Message, Feedback) lądują w OneLake,
- governance, RLS i audyt dziedziczone z Fabric,
- frontend hostowany jako StaticApp (`staticHosting.enabled: true`).

## Konfiguracja Azure OpenAI (opcjonalnie)

W `.env.local`:

```
VITE_AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com
VITE_AZURE_OPENAI_KEY=<key>
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
VITE_AZURE_OPENAI_API_VERSION=2024-10-21
```

⚠️ W produkcji **nie wystawiamy klucza Azure OpenAI z frontu** — przenieś
wywołanie do Rayfin Functions (sekcja `services.functions` w `rayfin.yml`)
i trzymaj sekrety po stronie serwisu.

## Struktura

```
rayfin/
  rayfin.yml                # services: auth + data (mssql) + staticHosting
  data/
    KnowledgeDoc.ts         # dokumenty FAQ / procedur / polityk
    Conversation.ts         # rozmowy użytkownika
    Message.ts              # wiadomości w rozmowie (+ citations JSON)
    Feedback.ts             # 👍/👎 + komentarz
    schema.ts               # schemat dla typed clienta
src/
  main.tsx, App.tsx
  hooks/AuthContext.tsx
  services/
    bootstrap.ts            # init Rayfin clienta z env
    rayfinClient.ts         # singleton
    knowledge.ts            # CRUD KnowledgeDoc
    conversations.ts        # CRUD Conversation
    messages.ts             # CRUD Message (citations JSON ↔ array)
    feedback.ts             # CRUD Feedback
    retrieval.ts            # BM25-lite po stronie klienta (MVP)
    llm.ts                  # ask() → Azure OpenAI / mock
    seed.ts                 # auto-seed 5 dokumentów
    errors.ts               # mapowanie AuthError → wylogowanie
  components/
    AuthPage.tsx, Sidebar.tsx, MessageBubble.tsx
  pages/
    ChatPage.tsx            # główny czat (auto-seed)
    KnowledgePage.tsx       # CRUD bazy wiedzy
```

## Co by się przeniosło do produkcji

1. **Retrieval** — z client-side BM25 na hybrid (BM25 + vector) w OneLake,
   wywoływany przez Rayfin Function `searchKnowledge`.
2. **LLM call** — przeniesione do Rayfin Function `ask`, klucz Azure OpenAI
   trzymany jako secret, frontend nie zna kluczy.
3. **Role** — dodać role `editor`/`admin` dla `KnowledgeDoc.update/delete`
   zamiast policy "tylko autor".
4. **RLS per region** — `claims.region.eq(item.region)`, żeby pracownik
   widział tylko procedury swojego regionu i ogólne.
5. **Feedback dashboard** — widok Fabric BI po `Feedback` × `Message`
   (% pozytywnych, top tematy z 👎).
```
