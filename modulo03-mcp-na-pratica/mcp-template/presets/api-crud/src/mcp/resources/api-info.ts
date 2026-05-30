import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * RESOURCE = read-only data the client can attach as context (like a GET).
 * The model does NOT call it like a tool; the user/app surfaces it. Use it to
 * describe your API, list fields, document auth — anything the agent should
 * "know" without spending a tool call.
 */
export function registerApiInfoResource(server: McpServer, baseUrl: string): void {
    server.registerResource(
        "api://info",
        "api://info",
        {
            description: "Describes this MCP's backend API: base URL, auth model, and entities",
        },
        () => ({
            contents: [
                {
                    uri: "api://info",
                    mimeType: "text/plain",
                    text: `
Base URL : ${baseUrl}
Auth     : Bearer service token (env SERVICE_TOKEN), sent as Authorization header
Rate limit: client-side token bucket + backend enforcement (429 -> RateLimitError)
Entity   : Resource { _id, name }   (rename to your domain)
Tools    : list_resources, get_resource, create_resource, update_resource, delete_resource
                    `.trim(),
                },
            ],
        }),
    );
}
