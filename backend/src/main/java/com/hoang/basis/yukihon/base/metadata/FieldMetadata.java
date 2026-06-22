package com.hoang.basis.yukihon.base.metadata;

import java.util.List;

/** Field-level schema exposed to the frontend for metadata-driven forms and tables. */
public record FieldMetadata(
        String name,
        String label,
        String type,
        boolean required,
        int order,
        String placeholder,
        List<String> enumValues,
        boolean listVisible,
        boolean readOnly) {}
