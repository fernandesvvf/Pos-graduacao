---
name: add-tool
description: Add a new tool to an MCP correctly — schema, thin handler, error path, registration.
---

# Add a tool

Prereq: `mcp-architecture`.

## Layered (api-crud)

1. **Schema** (if new shape): add to `src/domain/<entity>.ts`. Reuse existing
   schemas where possible. Remember the output schema must allow `isError`+`message`.

2. **Service method** (if new logic): add to `src/application/<entity>-service.ts`.
   Logic lives here, never in the handler.

3. **Tool file**: `src/mcp/tools/<verb>-<entity>.ts`. Copy this skeleton:

   ```ts
   import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import z from "zod";
   import type { ResourceService } from "../../application/resource-service.ts";
   import { ResourceMutationSchema } from "../../domain/resource.ts";

   export function registerDoThingTool(server: McpServer, service: ResourceService): void {
       server.registerTool(
           "do_thing",                                  // snake_case, verb-first
           {
               description: "One clear sentence the model reads to decide.",
               inputSchema: { id: z.string().describe("…") },   // describe() every field
               outputSchema: ResourceMutationSchema.shape,       // wide → allows error fields
           },
           async ({ id }) => {
               try {
                   const result = await service.doThing(id);
                   return {
                       content: [{ type: "text", text: result.message ?? "" }],
                       structuredContent: result,
                   };
               } catch (err) {
                   const message = `Failed to do thing. Error: ${err instanceof Error ? err.message : String(err)}`;
                   return {
                       content: [{ type: "text", text: message }],
                       structuredContent: { isError: true, message },
                   };
               }
           },
       );
   }
   ```

4. **Register**: import + call `registerDoThingTool(server, service)` in `src/mcp/server.ts`.

5. **Test**: add a case to `tests/tools/<entity>.e2e.test.ts`.

## Flat (standalone-tool)

Add the pure fn to `src/service.ts`, then a `server.registerTool(...)` block in
`src/mcp.ts` following the same result shape. Add a unit test in `tests/`.

## Naming + description tips

- `snake_case`, verb-first: `create_order`, `cancel_subscription`.
- The `description` is the model's only clue when to call it — be specific, mention what it returns.
- `.describe()` every input field. The model reads these too.

## Common mistakes

- Returning a field not in `outputSchema` → "must NOT have additional properties". Widen the schema.
- Throwing out of the handler instead of returning `{ isError: true }` → ugly client error.
- Putting logic in the handler instead of the service.
