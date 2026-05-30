# api-crud preset

Layered MCP server that exposes a REST API as tools. Based on aulas 06 + 07:
clean architecture + bearer auth + client-side rate limiting.

## Layers (dependency flows inward →)

```
src/
  domain/          schemas (Zod), types, errors, auth interface  ← no deps
  application/     resource-service.ts  (business logic)
  infrastructure/  resource-http-client.ts  (the only HTTP code)
  mcp/
    server.ts          composition root (wires everything)
    middleware/        rate-limiter.ts (token bucket)
    tools/             one file per tool (register pattern)
    resources/         read-only context
    prompts/           user-triggered templates
  index.ts         transport (stdio) only
```

Rule: `mcp → application → infrastructure → domain`. Never import backward.

## Run

```bash
npm install
SERVICE_TOKEN=<token> BASE_URL=http://localhost:9999/v1 npm start
npm test                 # unit tests (no backend) + e2e (needs backend)
npm run mcp:inspect      # open MCP Inspector to poke tools by hand
```

Wire into VS Code / Copilot via `.vscode/mcp.json` (fill in the token).

## Security model

- **Auth**: `SERVICE_TOKEN` env → `BearerAuth` → `Authorization: Bearer` header.
  Real auth lives in the backend (the MCP is a thin adapter). No token → `NoAuth` (dev).
- **Rate limit**: token bucket inside the MCP (`RATE_LIMIT_BURST`, `RATE_LIMIT_PER_SEC`)
  guards the backend *before* the network call. Backend 429 is also mapped.
- **Error translation**: HTTP 401/403/429 → `Unauthorized/Forbidden/RateLimit`
  domain errors → surfaced to the model as `isError + message`.

## Make it yours

See `skills/` at the template root. TL;DR:
1. Rename `Resource` → your entity in `domain/resource.ts`.
2. Adjust fields + endpoints in `infrastructure/resource-http-client.ts`.
3. Add/remove tools (copy a `tools/*.ts`, register it in `mcp/server.ts`).
4. Update `mcp/resources/api-info.ts` to describe your API.
