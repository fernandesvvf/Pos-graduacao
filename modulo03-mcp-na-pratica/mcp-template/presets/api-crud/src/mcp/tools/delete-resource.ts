import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import type { ResourceService } from "../../application/resource-service.ts";
import { ResourceMutationSchema } from "../../domain/resource.ts";

export function registerDeleteResourceTool(server: McpServer, service: ResourceService): void {
    server.registerTool(
        "delete_resource",
        {
            description: "Delete a resource by _id",
            inputSchema: {
                _id: z.string().describe("Backend id of the resource to delete"),
            },
            outputSchema: ResourceMutationSchema.shape,
        },
        async ({ _id }) => {
            try {
                const result = await service.remove(_id);
                return {
                    content: [{ type: "text", text: result.message ?? "" }],
                    structuredContent: result,
                };
            } catch (err) {
                const message = `Failed to delete resource. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        },
    );
}
