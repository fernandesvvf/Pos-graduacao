import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import type { ResourceService } from "../../application/resource-service.ts";
import { ResourceMutationSchema } from "../../domain/resource.ts";

export function registerCreateResourceTool(server: McpServer, service: ResourceService): void {
    server.registerTool(
        "create_resource",
        {
            description: "Create a new resource",
            inputSchema: {
                name: z.string().describe("Human-readable name"),
                // TODO: add your own creatable fields here
            },
            outputSchema: ResourceMutationSchema.shape,
        },
        async ({ name }) => {
            try {
                const result = await service.create({ name });
                return {
                    content: [{ type: "text", text: result.message ?? "" }],
                    structuredContent: result,
                };
            } catch (err) {
                const message = `Failed to create resource. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        },
    );
}
