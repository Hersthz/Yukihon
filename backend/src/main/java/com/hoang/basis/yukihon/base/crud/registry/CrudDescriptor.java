package com.hoang.basis.yukihon.base.crud.registry;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

/** Immutable description of a single auto-CRUD resource, built once at startup. */
@Getter
@Builder
public class CrudDescriptor {

    private final Class<?> entityClass;
    private final String path;
    private final Class<?> dtoClass; // null when responses serialize the entity directly
    private final String permissionPrefix; // null when no @ResourcePermission

    private final List<String> searchableFields;
    private final List<String> sortableFields;
    private final List<String> filterableFields;

    private final boolean softDelete;
    private final boolean enableBulkDelete;
    private final boolean autoRegister;

    private final String label;
    private final String plural;
    private final String description;

    // Menu (nullable group means no @ResourceMenu present)
    private final String menuTitle;
    private final String menuGroup;
    private final String menuIcon;
    private final String menuUrl;
    private final int menuOrder;
    private final String menuPermission;

    public boolean hasDto() {
        return dtoClass != null;
    }

    public boolean hasMenu() {
        return menuTitle != null && !menuTitle.isBlank();
    }

    /** Soft delete only applies when the entity actually extends BaseEntity. */
    public boolean supportsSoftDelete() {
        return softDelete && BaseEntity.class.isAssignableFrom(entityClass);
    }

    public boolean isBaseEntity() {
        return BaseEntity.class.isAssignableFrom(entityClass);
    }
}
