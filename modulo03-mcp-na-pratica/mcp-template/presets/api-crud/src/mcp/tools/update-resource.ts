import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ResourceService } from "../../application/resource-service.ts";
import {
    type ResourceUpdate,
    ResourceUpdateSchema,
    ResourceMutationSchema,
} from "../../domain/resource.ts";

export function registerUpdateResourceTool(server: McpServer, service: ResourceService): void {
    server.registerTool(
        "update_resource",
        {
            description: "Update an existing resource by _id",
            inputSchema: ResourceUpdateSchema.shape,
            outputSchema: ResourceMutationSchema.shape,
        },
        async ({ _id, ...data }: ResourceUpdate) => {
            try {
                const result = await service.update(_id, data);
                return {
                    content: [{ type: "text", text: result.message ?? "" }],
                    structuredContent: result,
                };
            } catch (err) {
                const message = `Failed to update resource. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        },
    );
}
