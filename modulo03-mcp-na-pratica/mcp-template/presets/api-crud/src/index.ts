import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./mcp/server.ts";

/**
 * ENTRYPOINT — owns the TRANSPORT only. stdio = JSON-RPC over stdin/stdout.
 * RULE: stdout is the protocol channel. Log ONLY to stderr (console.error),
 * never console.log, or you corrupt the stream.
 */
async function main() {
    // Fail fast on missing config. Default auth is Bearer via SERVICE_TOKEN;
    // remove this guard if you intend to run with NoAuth (dev only).
    if (!process.env.SERVICE_TOKEN) {
        console.error("[warn] SERVICE_TOKEN not set — running with NoAuth (dev mode)");
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Resource MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
