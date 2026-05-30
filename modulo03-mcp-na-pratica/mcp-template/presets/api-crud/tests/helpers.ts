import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * TEST HELPERS — spin up the MCP via a real stdio client (true e2e). The test
 * acts as the "agent". Adjust getServiceToken to your backend's auth endpoint.
 */
const API_URL = process.env.BASE_URL ?? "http://localhost:9999/v1";

export async function getServiceToken(): Promise<string> {
    const res = await fetch(`${API_URL}/auth/service-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // TODO: replace with your backend's credentials / token flow
        body: JSON.stringify({ username: "admin", password: "admin", adminSuperSecret: "secret" }),
    });
    if (!res.ok) throw new Error(`Failed to get service token: ${res.status}`);
    const { serviceToken } = (await res.json()) as { serviceToken: string };
    return serviceToken;
}

export async function createTestClient(serviceToken: string): Promise<Client> {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["--experimental-strip-types", "src/index.ts"],
        env: { ...process.env, SERVICE_TOKEN: serviceToken },
    });

    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);
    return client;
}
