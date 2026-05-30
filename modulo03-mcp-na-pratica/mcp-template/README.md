# MCP Template

Opinionated template for building MCP servers, distilled from aulas **05, 06 e 07**
da pós (engenharia de software aplicada a IA). Two presets + skills to mutate them.

```
mcp-template/
├── presets/
│   ├── standalone-tool/   flat, no backend, pure tool        (aula 05)
│   └── api-crud/          layered + auth + rate-limit         (aulas 06 + 07)
└── skills/                markdown recipes to scaffold/extend
```

## What is an MCP (1-minute model)

MCP = USB-C between an LLM client (Copilot, Claude) and your capabilities. Your
server exposes **3 primitives** over a transport (here: stdio / JSON-RPC):

| Primitive | What | Invoked by |
|-----------|------|-----------|
| **Tool** | an action the model can call (verb, side effects OK) | the model |
| **Resource** | read-only context (noun, like a GET) | app/user |
| **Prompt** | a reusable templated message | the user |

The MCP is a **thin adapter**: it translates model intent → action, and errors →
model-readable messages. Real auth / rate-limit / data live in your backend.

## How the aulas map here

| Aula | Concept | Where in the template |
|------|---------|----------------------|
| **05** mcps do zero | 3 primitives, result shape, stdio, pure service | `presets/standalone-tool` |
| **06** legacy API as MCP | clean architecture (domain/application/infra/mcp), one-file-per-tool | `presets/api-crud` layers |
| **07** security | bearer auth via env, error→domain mapping, rate-limit, e2e tests | `presets/api-crud` auth + middleware + tests |

## Quick start

```bash
# 1. pick a preset and copy it out
cp -r presets/api-crud ../my-mcp && cd ../my-mcp && npm install

# 2. (api-crud) rename the entity + endpoints — see skills/scaffold-new-mcp.md

# 3. verify
npm test
node --experimental-strip-types -e "import('./src/mcp/server.ts').then(()=>console.error('OK'))"
npm run mcp:inspect

# 4. connect: fill .vscode/mcp.json (command, args, env.SERVICE_TOKEN)
```

## Skills (read in this order)

1. **mcp-architecture** — the rules. Read first.
2. **scaffold-new-mcp** — bootstrap from a preset.
3. **add-tool** — add a tool the right way.
4. **add-auth-and-rate-limit** — wire security (aula 07).
5. **testing-mcp** — unit + e2e patterns.

These are plain markdown — feed one to your agent ("follow skills/add-tool.md")
or read them yourself.

## Non-negotiable rules (full list in skills/mcp-architecture.md)

- **stdout = protocol.** Logs go to `console.error`, never `console.log`.
- **Tool output schema is strict** — declare `isError` + `message` or the SDK rejects your error path.
- **No `constructor(private x)`** — strip-only TS rejects parameter properties; use `#fields`.
- **Handlers stay thin** — logic in the service, not in the tool or `server.ts`.
- **Layered deps flow inward**: `mcp → application → infrastructure → domain`.

## Stack

Node ≥22 with native TS (`--experimental-strip-types`, no build) ·
`@modelcontextprotocol/sdk` · Zod · stdio transport · `node:test`.

## Verified

Both presets install, pass their tests, and boot cleanly (`npm test` green,
server module imports without error).
