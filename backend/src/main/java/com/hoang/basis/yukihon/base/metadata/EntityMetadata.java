package com.hoang.basis.yukihon.base.metadata;

import java.util.List;

/** Resource-level schema exposed to the frontend ({@code /api/meta/entities}). */
public record EntityMetadata(
        String name,
        String plural,
        String path,
        String description,
        String permissionPrefix,
        boolean softDelete,
        boolean enableBulkDelete,
        List<String> searchableFields,
        List<String> sortableFields,
        MenuMetadata menu,
        List<FieldMetadata> fields
) {
    public record MenuMetadata(String title, String group, String icon, String url, int order, String permission) {
    }
}
