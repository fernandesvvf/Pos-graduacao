---
name: add-auth-and-rate-limit
description: Wire bearer auth + client-side rate limiting into an MCP, and map backend security errors. Based on aula 07.
---

# Add auth + rate limiting

Prereq: `mcp-architecture`. The `api-crud` preset ships this already wired — this
skill explains it and shows how to add it to a bare MCP.

## Mental model (aula 07)

The MCP is a thin adapter. **Auth and rate-limiting are enforced by the backend.**
The MCP:
1. attaches an auth header to every call,
2. optionally throttles itself before hitting the network (a guard),
3. translates backend security errors into named, model-readable messages.

## 1 — Auth (Bearer token via env)

`src/domain/auth.ts`:
```ts
export interface AuthProvider { headers(): Record<string, string>; }
export class BearerAuth implements AuthProvider {
    #token: string;
    constructor(token: string) { if (!token) throw new Error("token required"); this.#token = token; }
    headers() { return { Authorization: `Bearer ${this.#token}` }; }
}
export class NoAuth implements AuthProvider { headers() { return {}; } }
```
Pick the provider in `mcp/server.ts` from env:
```ts
const auth = process.env.SERVICE_TOKEN ? new BearerAuth(process.env.SERVICE_TOKEN) : new NoAuth();
```
The HTTP client spreads `auth.headers()` into every request. **Never hardcode
tokens** — they come from `env` (set in `.vscode/mcp.json` or the shell).

### Where does the token come from?
The backend issues it (aula 07: `POST /v1/auth/service-token` with admin creds +
super-secret → returns a `serviceToken`). The MCP just carries it. In tests,
fetch it at setup (see `tests/helpers.ts`).

## 2 — Client-side rate limit (token bucket)

`src/mcp/middleware/rate-limiter.ts` — `capacity` tokens, refilled `refillPerSec`.
`take()` spends one or throws `RateLimitError`. Call it at the top of every
outgoing request in the HTTP client:
```ts
this.#limiter?.take();   // before fetch
```
Configure via env: `RATE_LIMIT_BURST` (capacity), `RATE_LIMIT_PER_SEC` (refill).
This is a *guard* — the backend is still the real limiter.

## 3 — Map backend errors → domain errors

`src/domain/errors.ts`: `UnauthorizedError` (401), `ForbiddenError` (403),
`RateLimitError` (429). In the HTTP client:
```ts
async #assertOk(res: Response) {
    if (res.status === 401) throw new UnauthorizedError();
    if (res.status === 403) throw new ForbiddenError();
    if (res.status === 429) throw new RateLimitError();
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText} - ${await res.text()}`);
}
```
Tools catch these and return `{ isError: true, message }` — so the model sees
"Rate limit exceeded…" not a stack trace.

## Checklist

- [ ] Token read from `env`, never hardcoded
- [ ] `auth.headers()` spread into every request
- [ ] `limiter.take()` called before each fetch
- [ ] 401/403/429 mapped to domain errors
- [ ] Tools surface the message via `isError`
- [ ] A test asserts the invalid-token path returns `isError` (see aula 07 test)
