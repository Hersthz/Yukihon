import apiClient from "@/lib/apiClient";

export interface FieldMetadata {
  name: string;
  label: string;
  type: string; // text | textarea | number | boolean | date | select | password | image | icon
  required: boolean;
  order: number;
  placeholder: string;
  enumValues: string[];
  listVisible: boolean;
  readOnly: boolean;
}

export interface EntityMenuMetadata {
  title: string;
  group: string;
  icon: string;
  url: string;
  order: number;
  permission: string;
}

export interface EntityMetadata {
  name: string;
  plural: string;
  path: string;
  description: string;
  permissionPrefix: string | null;
  softDelete: boolean;
  enableBulkDelete: boolean;
  searchableFields: string[];
  sortableFields: string[];
  menu: EntityMenuMetadata | null;
  fields: FieldMetadata[];
}

export const metaApi = {
  getEntities: () => apiClient.request<EntityMetadata[]>("/api/meta/entities"),
  getEntity: (name: string) => apiClient.request<EntityMetadata>(`/api/meta/entities/${encodeURIComponent(name)}`),
};

export default metaApi;
