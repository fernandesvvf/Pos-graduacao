import z from "zod";

/**
 * DOMAIN — single source of truth for shapes + types.
 * No deps on application/infrastructure/mcp. Everything points INWARD to here.
 *
 * RENAME GUIDE: swap "Resource" for your entity (e.g. Customer, Order, Invoice)
 * and adjust the fields. Keep the schema/type pairs together.
 */

// The full entity as stored/returned by the backend.
export const ResourceSchema = z.object({
    _id: z.string().optional().describe("Backend id of the resource"),
    name: z.string().describe("Human-readable name"),
    // TODO: add your own fields here
});
export type Resource = z.infer<typeof ResourceSchema>;

// Query shape for lookups — every field optional so callers can search by any.
export const ResourceQuerySchema = z.object({
    _id: z.string().optional().describe("Backend id of the resource"),
    name: z.string().optional().describe("Name to search by (substring match)"),
});
export type ResourceQuery = z.infer<typeof ResourceQuerySchema>;

// Update shape — id required, rest optional.
export const ResourceUpdateSchema = ResourceQuerySchema.extend({
    _id: z.string().describe("Backend id of the resource to update"),
});
export type ResourceUpdate = z.infer<typeof ResourceUpdateSchema>;

/**
 * Mutation result — what create/update/delete tools return.
 * IMPORTANT: outputSchema is STRICT. Every field a tool may put in
 * structuredContent must be declared here, or the SDK rejects it with
 * "data must NOT have additional properties". That bit Erick in aula 06.
 */
export const ResourceMutationSchema = z.object({
    id: z.string().optional().describe("Id of the affected resource"),
    message: z.string().optional().describe("Confirmation message"),
    isError: z.boolean().optional().describe("True when the operation failed"),
    resource: ResourceSchema.optional().describe("The single affected/found resource"),
    resources: z.array(ResourceSchema).optional().describe("List of resources"),
});
export type ResourceMutation = z.infer<typeof ResourceMutationSchema>;
