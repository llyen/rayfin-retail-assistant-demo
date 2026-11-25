# Ask RetailCo (retail AI assistant demo)

An "Ask Me Anything" demo assistant for staff of RetailCo, a fictional chain of DIY and garden stores (store staff, store managers, head office), built on Rayfin (backend-as-a-service on Microsoft Fabric). The UI is in Polish.

Polish version: [README.pl.md](README.pl.md).

## What it does

- Sign-in with email/password (local backend) or Microsoft Entra ID via Fabric.
- Chat with answers grounded in a small knowledge base. Retrieval is a client-side BM25-like keyword search over `KnowledgeDoc`.
- Answers come from Azure OpenAI if it is configured in `.env.local`. Otherwise a deterministic mock returns fragments of the knowledge base.
- Conversations, messages with citations, and thumbs up/down feedback are stored per user.
- A knowledge base page with create, edit and delete for documents.
- On first sign-in the app seeds five sample documents (leave requests, seasonal display, workwear, health and safety, store opening).

Entities in `rayfin/data/`: `KnowledgeDoc`, `Conversation`, `Message`, `Feedback`. Every signed-in user can read the knowledge base; conversations and feedback are visible only to their author.

## Stack

React 19, Vite 7, Tailwind CSS 4, TypeScript, `@microsoft/rayfin-client`.

## Running locally

Requirements: Node.js 20+, Docker Desktop.

```bash
npm ci
cp .env.example .env.local     # optional: Azure OpenAI settings
npm run rayfin:db              # apply the schema (starts the containers)
npm run dev:local              # backend in Docker + Vite on http://localhost:5173
```

## Deploying to Microsoft Fabric

```bash
npx rayfin login -t <TENANT_ID>
npm run up
```

After the first deployment add the app URL to `allowedRedirectUris` in `rayfin/rayfin.yml` if the CLI has not done it.

## Security note

In this demo the Azure OpenAI key, if set, is read in the browser (`VITE_*` variables). Do not do this in production. Move the call to a server-side function and keep the key there.

## Disclaimer

RetailCo is a fictional company. The sample documents are invented. This is a demo, not a production system, and not an official Microsoft product.

## License

MIT, see [LICENSE](LICENSE).
