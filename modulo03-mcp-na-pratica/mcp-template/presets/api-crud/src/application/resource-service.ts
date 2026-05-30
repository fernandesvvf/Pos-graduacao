import type { Resource, ResourceQuery, ResourceMutation } from "../domain/resource.ts";
import type { AuthProvider } from "../domain/auth.ts";
import { ResourceHttpClient } from "../infrastructure/resource-http-client.ts";
import type { RateLimiter } from "../mcp/middleware/rate-limiter.ts";

/**
 * APPLICATION — business logic / orchestration. Knows about the domain and the
 * client, NOT about HTTP or MCP. This is where multi-step rules live (e.g.
 * "find by id, else fetch all and filter"). Keep tools dumb; keep logic here.
 */
export class ResourceService {
    private readonly client: ResourceHttpClient;

    constructor(baseUrl: string, auth: AuthProvider, limiter?: RateLimiter) {
        this.client = new ResourceHttpClient(baseUrl, auth, limiter);
    }

    list(): Promise<Resource[]> {
        return this.client.list();
    }

    create(resource: Omit<Resource, "_id">): Promise<ResourceMutation> {
        return this.client.create(resource);
    }

    /** Find by id (cheap) or by any field via substring match over the list. */
    async find(query: ResourceQuery): Promise<Resource | null> {
        if (query._id) return this.client.getById(query._id);

        const resources = await this.client.list();
        const entries = Object.entries(query) as [keyof Resource, string][];
        return (
            resources.find((resource) =>
                entries.every(([key, value]) => resource[key]?.includes(value)),
            ) ?? null
        );
    }

    update(id: string, data: Partial<Omit<Resource, "_id">>): Promise<ResourceMutation> {
        return this.client.update(id, data);
    }

    remove(id: string): Promise<ResourceMutation> {
        return this.client.remove(id);
    }
}
