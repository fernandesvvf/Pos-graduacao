---
name: scaffold-new-mcp
description: Bootstrap a new MCP from a preset — pick flat vs layered, copy, rename the entity, wire it up.
---

# Scaffold a new MCP

Prereq: read `mcp-architecture`.

## Step 1 — pick a preset

| Need | Preset |
|------|--------|
| Pure compute, no external API (parse, transform, calculate) | `standalone-tool` |
| Wraps a REST backend, needs CRUD / auth / rate-limit | `api-crud` |

```bash
cp -r presets/<preset> ../<your-mcp-name>
cd ../<your-mcp-name>
npm install
```

## Step 2 — name it

Edit `package.json`: `name`, `description`, `bin` key. Edit the `McpServer({ name, version })` in `mcp/server.ts` (or `mcp.ts` for standalone).

## Step 3 (api-crud only) — model your entity

1. `src/domain/<entity>.ts` — rename `Resource` → your entity everywhere; set real fields on `ResourceSchema`. Keep the `*MutationSchema` wide (id, message, isError, + your success fields).
2. `src/infrastructure/<entity>-http-client.ts` — fix endpoint paths (`/resources` → `/yourthing`) and request/response shapes.
3. `src/application/<entity>-service.ts` — adjust business logic (the `find` substring search, etc.).
4. Rename the files to your entity for clarity (`resource-service.ts` → `order-service.ts`); update imports.

## Step 4 — tools

Keep/rename the CRUD tools you need; delete the rest; add new ones via the `add-tool` skill. Register each in `mcp/server.ts`.

## Step 5 (api-crud) — security

See `add-auth-and-rate-limit`. Default is Bearer via `SERVICE_TOKEN` env + token-bucket limiter — already wired; you mostly just set env.

## Step 6 — describe + verify

- Update `mcp/resources/api-info.ts` (or the resource in `mcp.ts`) to describe your real API.
- Verify:
  ```bash
  npm test
  node --experimental-strip-types -e "import('./src/mcp/server.ts').then(()=>console.error('OK'))"
  npm run mcp:inspect   # click through tools
  ```

## Step 7 — connect

Fill `.vscode/mcp.json` (command/args/env). Token goes in `env.SERVICE_TOKEN`.

## Done-checklist

- [ ] No `console.log` anywhere (only `console.error`)
- [ ] Every tool's `outputSchema` includes `isError`+`message`
- [ ] No `constructor(private …)` param properties
- [ ] `api-info` resource matches reality
- [ ] `npm test` green; server boots
