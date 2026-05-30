---
name: testing-mcp
description: How to test an MCP — unit tests for pure logic, e2e tests that drive the server through a real stdio client.
---

# Testing an MCP

Runner: `node --test` (native), files `tests/**/*.test.ts`. No Jest/Vitest.

## Two layers of test

### Unit — pure logic, no server, no backend (fast, run always)
Test services / middleware directly:
```ts
import { describe, it } from "node:test";
import assert from "node:assert";
import { RateLimiter } from "../src/mcp/middleware/rate-limiter.ts";

describe("RateLimiter", () => {
    it("throws when empty", () => {
        const l = new RateLimiter(1, 1);
        l.take();
        assert.throws(() => l.take());
    });
});
```
Name them `*.unit.test.ts`.

### E2E — drive the real MCP through a client (true integration)
Your test acts as the agent: spin the server over stdio, call tools, assert.
```ts
const transport = new StdioClientTransport({
    command: "node",
    args: ["--experimental-strip-types", "src/index.ts"],
    env: { ...process.env, SERVICE_TOKEN: token },
});
const client = new Client({ name: "test", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);
const r = await client.callTool({ name: "list_resources", arguments: {} });
```
Name them `*.e2e.test.ts`. Needs the backend running (set `BASE_URL`).

## What to assert (from aula 07)

- **Happy path**: `structuredContent` has expected shape.
- **Invalid token**: `isError === true` and message mentions "unauthorized".
- **Rate limit**: loop calls until `isError`, assert message mentions rate limit.
- **Bad input**: e.g. invalid id → `isError` with the backend's message.

## Run

```bash
npm test                              # all
node --test tests/**/*.unit.test.ts   # unit only (CI-safe, no backend)
npm run test:dev                      # watch mode
```

## Tips

- Get the service token in `beforeEach` via a helper (see `tests/helpers.ts`).
- `afterEach` → `client.close()` so stdio processes don't leak.
- Keep at least one unit test that needs no backend so CI always has signal.
