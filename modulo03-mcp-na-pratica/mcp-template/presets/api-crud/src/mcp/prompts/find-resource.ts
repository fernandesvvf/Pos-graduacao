import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * PROMPT = a reusable, parameterized message template the USER triggers (e.g.
 * a slash-command in the client). It returns messages, not data. Use it to
 * standardize a common multi-tool workflow so the user doesn't retype it.
 */
export function registerFindResourcePrompt(server: McpServer): void {
    server.registerPrompt(
        "find_resource_prompt",
        {
            description: "Find a resource by name or id using the get_resource tool",
            argsSchema: {
                query: z.string().describe("Name or id to search for"),
            },
        },
        ({ query }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Find the resource matching "${query}" using the get_resource tool, then summarize what you found.`,
                    },
                },
            ],
        }),
    );
}
