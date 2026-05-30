import type { Resource, ResourceMutation } from "../domain/resource.ts";
import type { AuthProvider } from "../domain/auth.ts";
import { UnauthorizedError, ForbiddenError, RateLimitError } from "../domain/errors.ts";
import type { RateLimiter } from "../mcp/middleware/rate-limiter.ts";

/**
 * INFRASTRUCTURE — the ONLY layer that knows about HTTP / the backend.
 * Swap this out to target a different transport (gRPC, DB, SDK) without
 * touching application or mcp layers.
 *
 * Responsibilities:
 *   1. attach auth headers (via AuthProvider)
 *   2. throttle outgoing calls (client-side RateLimiter) — optional
 *   3. translate HTTP status -> named domain errors (#assertOk)
 */
export class ResourceHttpClient {
    #baseUrl: string;
    #auth: AuthProvider;
    #limiter?: RateLimiter;

    constructor(baseUrl: string, auth: AuthProvider, limiter?: RateLimiter) {
        this.#baseUrl = baseUrl;
        this.#auth = auth;
        this.#limiter = limiter;
    }

    /** Wrap fetch: spend a rate-limit token, then attach auth headers. */
    async #request(path: string, init: RequestInit = {}): Promise<Response> {
        this.#limiter?.take(); // throws RateLimitError if bucket empty
        return fetch(`${this.#baseUrl}${path}`, {
            ...init,
            headers: { ...(init.headers ?? {}), ...this.#auth.headers() },
        });
    }

    /** Map transport status codes to domain errors. */
    async #assertOk(res: Response): Promise<void> {
        if (res.status === 401) throw new UnauthorizedError();
        if (res.status === 403) throw new ForbiddenError();
        if (res.status === 429) throw new RateLimitError();
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} - ${res.statusText} - ${await res.text()}`);
        }
    }

    async list(): Promise<Resource[]> {
        const res = await this.#request("/resources");
        await this.#assertOk(res);
        return res.json() as Promise<Resource[]>;
    }

    async getById(id: string): Promise<Resource | null> {
        const res = await this.#request(`/resources/${id}`);
        if (res.status === 404 || res.status === 400) return null;
        await this.#assertOk(res);
        return res.json() as Promise<Resource>;
    }

    async create(data: Omit<Resource, "_id">): Promise<ResourceMutation> {
        const res = await this.#request("/resources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        await this.#assertOk(res);
        return res.json() as Promise<ResourceMutation>;
    }

    async update(id: string, data: Partial<Omit<Resource, "_id">>): Promise<ResourceMutation> {
        const res = await this.#request(`/resources/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        await this.#assertOk(res);
        return res.json() as Promise<ResourceMutation>;
    }

    async remove(id: string): Promise<ResourceMutation> {
        const res = await this.#request(`/resources/${id}`, { method: "DELETE" });
        await this.#assertOk(res);
        return res.json() as Promise<ResourceMutation>;
    }
}
