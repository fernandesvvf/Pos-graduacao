---
name: mcp-architecture
description: Core rules and conventions every MCP in this stack must follow. Read first; the other skills assume these.
---

# MCP Architecture — the constitution

Stack: Node ≥22 (native TS via `--experimental-strip-types`), `@modelcontextprotocol/sdk`, Zod, stdio transport. No build step.

## The 3 primitives (know which you need)

| Primitive | Use when | Who invokes | API |
|-----------|----------|-------------|-----|
| **Tool** | The model should *do* something (has side effects or computes) | Model | `server.registerTool(name, {description, inputSchema, outputSchema}, handler)` |
| **Resource** | The agent should *read* context without spending a tool call | App/user | `server.registerResource(uri, uri, {description}, handler)` |
| **Prompt** | The user wants a reusable templated workflow | User | `server.registerPrompt(name, {description, argsSchema}, handler)` |

## Hard rules (violating breaks things)

1. **stdout is the protocol.** Never `console.log`. Logs → `console.error` only.
2. **Tool result shape is fixed:**
   ```ts
   // success
   return { content: [{ type: "text", text }], structuredContent: {...} };
   // failure — surface a readable message, don't throw out of the handler
   return { content: [{ type: "text", text: message }], structuredContent: { isError: true, message } };
   ```
3. **outputSchema is strict.** Every key you put in `structuredContent` (success AND error path) must be declared, or the SDK throws `data must NOT have additional properties`. Use a wide `*MutationSchema.shape` that includes `isError` + `message`.
4. **No TS parameter properties** (`constructor(private x)`) — strip-only mode rejects them. Declare fields explicitly and assign in the body. Use `#private` fields.
5. **Handlers are thin.** They call the service, shape the result, catch errors. No business logic in the handler or in `mcp/server.ts`.

## Layering (api-crud preset)

```
mcp → application → infrastructure → domain
```
- **domain/** — Zod schemas, types, errors, auth interface. Zero deps. Source of truth.
- **application/** — service: business logic, orchestration. Knows domain + client.
- **infrastructure/** — the ONLY place with HTTP/fetch. Maps status → domain errors.
- **mcp/** — `server.ts` (composition root) + `tools/ resources/ prompts/` (one file each) + `middleware/`.
- **index.ts** — transport only.

Never import "outward" (domain must not import application, etc.).

## When flat vs layered

- **standalone-tool preset (flat)**: pure compute, no backend, ≤ a few tools. `service.ts` + `mcp.ts` + `index.ts`.
- **api-crud preset (layered)**: calls a backend, needs auth/rate-limit, or grows. Use the full split.

Start flat, graduate when it hurts.

## The MCP is a thin adapter

Real auth + rate limiting live in the BACKEND. The MCP's job: translate model
intent → API call, and API error → model-readable message. Client-side rate
limiting here is a *guard*, not the source of truth.
