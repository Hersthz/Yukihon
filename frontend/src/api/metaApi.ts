import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type FieldMetadata = Schema<"FieldMetadata">;

export type EntityMenuMetadata = Schema<"MenuMetadata">;

export type EntityMetadata = Schema<"EntityMetadata">;

export type AutoMenuItem = Schema<"MenuItem">;

export type AutoMenuGroup = Schema<"MenuGroup">;

export const metaApi = {
  getEntities: () => apiClient.get<EntityMetadata[]>("/api/meta/entities"),
  getEntity: (name: string) =>
    apiClient.get<EntityMetadata>(`/api/meta/entities/${encodeURIComponent(name)}`),
  getMenu: () => apiClient.get<AutoMenuGroup[]>("/api/meta/menu"),
};

export default metaApi;
