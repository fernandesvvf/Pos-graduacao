import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ResourceService } from "../../application/resource-service.ts";
import { ResourceMutationSchema } from "../../domain/resource.ts";

/**
 * TOOL = action the model can call. Pattern for every tool:
 *   register(server, service) -> server.registerTool(name, {desc,in,out}, handler)
 * Handler is THIN: call service, shape result, catch -> isError. No logic here.
 *
 * outputSchema uses ResourceMutationSchema.shape so BOTH the success fields
 * (resources) and the error fields (isError, message) are valid. Declaring a
 * narrower schema triggers the SDK's "must NOT have additional properties"
 * error on the catch path (the aula 06 gotcha).
 */
export function registerListResourcesTool(server: McpServer, service: ResourceService): void {
    server.registerTool(
        "list_resources",
        {
            description: "List all resources",
            inputSchema: {},
            outputSchema: ResourceMutationSchema.shape,
        },
        async () => {
            try {
                const resources = await service.list();
                return {
                    content: [{ type: "text", text: JSON.stringify(resources) }],
                    structuredContent: { resources },
                };
            } catch (err) {
                const message = `Failed to list resources. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        },
    );
}
