import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { slugify, wordCount } from "./service.ts";

/**
 * FLAT MCP (aula 05 style) — one file wires every primitive. Good for small
 * MCPs with no backend. When it grows past a few tools, graduate to the
 * api-crud preset's layered layout.
 *
 * The 3 primitives are all here: a TOOL, a RESOURCE, and a PROMPT.
 */
export const server = new McpServer({
    name: "@you/standalone-mcp",
    version: "0.0.1",
});

// --- TOOL: model-callable action ---------------------------------------------
server.registerTool(
    "slugify_text",
    {
        description: "Convert text into a URL-friendly slug and report the word count",
        inputSchema: {
            text: z.string().describe("The text to slugify"),
        },
        outputSchema: {
            slug: z.string().describe("URL-friendly slug"),
            words: z.number().describe("Word count of the input"),
        },
    },
    async ({ text }) => {
        try {
            const slug = slugify(text);
            const words = wordCount(text);
            return {
                content: [{ type: "text", text: slug }],
                structuredContent: { slug, words },
            };
        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Failed to slugify. Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    },
);

// --- RESOURCE: read-only context ---------------------------------------------
server.registerResource(
    "slugify://info",
    "slugify://info",
    { description: "Describes how the slugify_text tool transforms input" },
    () => ({
        contents: [
            {
                uri: "slugify://info",
                mimeType: "text/plain",
                text: [
                    "Rules: lowercase, strip accents, non-alphanumeric -> '-', trim leading/trailing '-'.",
                    "Output: { slug, words }.",
                ].join("\n"),
            },
        ],
    }),
);

// --- PROMPT: user-triggered template -----------------------------------------
server.registerPrompt(
    "slugify_prompt",
    {
        description: "Slugify a piece of text using the slugify_text tool",
        argsSchema: { text: z.string().describe("Text to slugify") },
    },
    ({ text }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Slugify this text using slugify_text:\n${text}`,
                },
            },
        ],
    }),
);
