import type { components, paths, operations } from "./schema";

/**
 * Ergonomic aliases over the auto-generated OpenAPI types in `schema.d.ts`.
 * Regenerate the schema with `npm run gen:api` (backend must be running).
 *
 *   import type { Schemas } from "@/api/types";
 *   type Deck = Schemas["DeckDto"];
 */
export type { components, paths, operations };

/** All DTO/request schemas keyed by name, e.g. `Schemas["UserDto"]`. */
export type Schemas = components["schemas"];

/** A single DTO by name: `Schema<"DeckDto">`. */
export type Schema<K extends keyof Schemas> = Schemas[K];
