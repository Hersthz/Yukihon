package com.hoang.basis.yukihon.base.crud.registry;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * DB-free verification that the auto-CRUD discovery pipeline finds {@code @AutoCrud} entities and
 * builds descriptors with the correct metadata. Does not load a Spring context or touch the
 * database.
 */
class AutoCrudScannerTest {

    private static final String BASE_PACKAGE = "com.hoang.basis.yukihon";

    @Test
    void discoversAppSettingWithCorrectDescriptor() {
        List<CrudDescriptor> descriptors = new AutoCrudScanner(BASE_PACKAGE).scan();

        CrudDescriptor appSetting = descriptors.stream()
                .filter(d -> "app-settings".equals(d.getPath()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("AppSetting @AutoCrud was not discovered"));

        assertEquals("APP_SETTING", appSetting.getPermissionPrefix(), "permission prefix");
        assertEquals("App Settings", appSetting.getPlural(), "entity plural label");
        assertTrue(appSetting.getSearchableFields().contains("settingKey"), "searchable fields");
        assertTrue(appSetting.isBaseEntity(), "extends BaseEntity");
        assertTrue(appSetting.supportsSoftDelete(), "soft delete enabled");
        assertTrue(appSetting.isEnableBulkDelete(), "bulk delete enabled by default");
        assertTrue(appSetting.hasMenu(), "has @ResourceMenu");
        assertEquals("System", appSetting.getMenuGroup(), "menu group");
    }
}
