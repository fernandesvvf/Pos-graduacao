import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ResourceService } from "../../application/resource-service.ts";
import {
    type ResourceQuery,
    ResourceQuerySchema,
    ResourceMutationSchema,
} from "../../domain/resource.ts";

export function registerGetResourceTool(server: McpServer, service: ResourceService): void {
    server.registerTool(
        "get_resource",
        {
            description: "Find a single resource by _id or by name (substring match)",
            inputSchema: ResourceQuerySchema.shape,
            outputSchema: ResourceMutationSchema.shape,
        },
        async (query: ResourceQuery) => {
            try {
                const resource = await service.find(query);
                return {
                    content: [{ type: "text", text: JSON.stringify(resource) }],
                    structuredContent: { resource: resource ?? undefined },
                };
            } catch (err) {
                const message = `Failed to get resource. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        },
    );
}
