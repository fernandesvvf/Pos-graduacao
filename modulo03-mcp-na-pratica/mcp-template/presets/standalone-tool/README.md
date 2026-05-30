# standalone-tool preset

Flat MCP server with no backend — pure local logic (aula 05 style). Use when
your tool just computes something (transform, parse, calculate) and never calls
an external API.

## Files

```
src/
  service.ts   pure functions (unit-testable, no I/O)
  mcp.ts       wires the 3 primitives: tool + resource + prompt
  index.ts     stdio transport
```

No domain/application/infrastructure split — overkill at this size. When you add
a backend or grow past a handful of tools, switch to the `api-crud` preset.

## Run

```bash
npm install
npm start
npm test            # pure unit tests
npm run mcp:inspect # poke the tool by hand
```

## Make it yours

1. Replace `slugify`/`wordCount` in `service.ts` with your logic.
2. Update the tool's name, schemas, and handler in `mcp.ts`.
3. Adjust the resource + prompt to match. Done.

See the template root `skills/` for guided modification recipes.
