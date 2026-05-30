import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { BearerAuth, NoAuth, type AuthProvider } from "../domain/auth.ts";
import { rateLimiterFromEnv } from "./middleware/rate-limiter.ts";
import { ResourceService } from "../application/resource-service.ts";

import { registerListResourcesTool } from "./tools/list-resources.ts";
import { registerGetResourceTool } from "./tools/get-resource.ts";
import { registerCreateResourceTool } from "./tools/create-resource.ts";
import { registerUpdateResourceTool } from "./tools/update-resource.ts";
import { registerDeleteResourceTool } from "./tools/delete-resource.ts";
import { registerApiInfoResource } from "./resources/api-info.ts";
import { registerFindResourcePrompt } from "./prompts/find-resource.ts";

/**
 * COMPOSITION ROOT — the only place that knows how the pieces fit together.
 * Build dependencies here (config -> auth -> limiter -> service) and register
 * every tool/resource/prompt. server.ts stays declarative; logic lives below.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost:9999/v1";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN ?? "";

// Pick auth strategy from env. Default Bearer (course style); NoAuth for dev.
const auth: AuthProvider = SERVICE_TOKEN ? new BearerAuth(SERVICE_TOKEN) : new NoAuth();

// Client-side throttle (token bucket) — guards the backend before the network.
const limiter = rateLimiterFromEnv();

const service = new ResourceService(BASE_URL, auth, limiter);

export const server = new McpServer({
    name: "@you/resource-mcp",
    version: "0.0.1",
});

registerListResourcesTool(server, service);
registerGetResourceTool(server, service);
registerCreateResourceTool(server, service);
registerUpdateResourceTool(server, service);
registerDeleteResourceTool(server, service);
registerApiInfoResource(server, BASE_URL);
registerFindResourcePrompt(server);
