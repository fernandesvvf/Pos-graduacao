import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { createTestClient, getServiceToken } from "../helpers.ts";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Resource, ResourceMutation } from "../../src/domain/resource.ts";

/**
 * E2E — drives the MCP through a real client against a live backend.
 * Requires the backend running on BASE_URL. Skip in CI if no backend.
 *
 * RENAME these tests as you rename the entity. Pattern mirrors aula 07.
 */
type ResourceResult = { structuredContent: { resource?: Resource | null; isError?: boolean; message?: string } };
type ResourcesResult = { structuredContent: { resources?: Resource[]; isError?: boolean; message?: string } };
type MutationResult = { structuredContent: ResourceMutation };

describe("Resource Tools (e2e)", () => {
    let client: Client;
    let createdId: string;

    beforeEach(async () => {
        const token = await getServiceToken();
        client = await createTestClient(token);
    });

    afterEach(async () => {
        await client.close();
    });

    it("lists resources", async () => {
        const r = (await client.callTool({ name: "list_resources", arguments: {} })) as unknown as ResourcesResult;
        assert.ok(Array.isArray(r.structuredContent.resources), "should return an array");
    });

    it("creates a resource", async () => {
        const r = (await client.callTool({
            name: "create_resource",
            arguments: { name: "Test Resource" },
        })) as unknown as MutationResult;
        assert.ok(r.structuredContent.id, "should return new id");
        createdId = r.structuredContent.id!;
    });

    it("gets the created resource by id", async () => {
        const r = (await client.callTool({
            name: "get_resource",
            arguments: { _id: createdId },
        })) as unknown as ResourceResult;
        assert.strictEqual(r.structuredContent.resource?.name, "Test Resource");
    });

    it("returns isError on invalid service token", async () => {
        const bad = await createTestClient("invalid-token");
        try {
            const r = (await bad.callTool({ name: "list_resources", arguments: {} })) as unknown as ResourcesResult;
            assert.strictEqual(r.structuredContent.isError, true);
            assert.ok(r.structuredContent.message?.toLowerCase().includes("unauthorized"));
        } finally {
            await bad.close();
        }
    });

    it("deletes the resource", async () => {
        const r = (await client.callTool({
            name: "delete_resource",
            arguments: { _id: createdId },
        })) as unknown as MutationResult;
        assert.ok(r.structuredContent.message, "should confirm deletion");
    });
});
