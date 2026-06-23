package com.hoang.basis.yukihon.system.appsetting.entity;

import com.hoang.basis.yukihon.base.annotation.AuditEnabled;
import com.hoang.basis.yukihon.base.annotation.AutoCrud;
import com.hoang.basis.yukihon.base.annotation.EntityLabel;
import com.hoang.basis.yukihon.base.annotation.FieldMeta;
import com.hoang.basis.yukihon.base.annotation.Filterable;
import com.hoang.basis.yukihon.base.annotation.ResourceMenu;
import com.hoang.basis.yukihon.base.annotation.ResourcePermission;
import com.hoang.basis.yukihon.base.annotation.Searchable;
import com.hoang.basis.yukihon.base.annotation.SoftDelete;
import com.hoang.basis.yukihon.base.annotation.Sortable;
import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * First entity wired entirely through the auto-CRUD framework — no controller / service /
 * repository. Serves as a key/value application configuration store and as the Phase 0 proof
 * that {@code @AutoCrud} works against SQL Server + Flyway.
 */
@Entity
@Table(
        name = "app_settings",
        uniqueConstraints = @UniqueConstraint(name = "uk_app_setting_key", columnNames = "setting_key"))
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "app-settings")
@SoftDelete
@AuditEnabled
@ResourcePermission("APP_SETTING")
@EntityLabel(name = "App Setting", plural = "App Settings", description = "Key/value application configuration")
@ResourceMenu(
        title = "App Settings",
        group = "System",
        icon = "settings",
        url = "/admin/app-settings",
        order = 90,
        permission = "APP_SETTING_READ")
@Searchable(fields = {"settingKey", "category", "description"})
@Filterable(fields = {"category"})
@Sortable(fields = {"settingKey", "category", "createdAt", "updatedAt"})
public class AppSetting extends BaseEntity {

    @Column(name = "setting_key", nullable = false, length = 150)
    @FieldMeta(label = "Key", required = true, order = 1, placeholder = "feature.kana-game.enabled")
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Value", type = "textarea", order = 2)
    private String settingValue;

    @Column(name = "category", length = 100)
    @FieldMeta(label = "Category", order = 3, placeholder = "feature-flags")
    private String category;

    @Column(name = "description", columnDefinition = "VARCHAR(500)")
    @FieldMeta(label = "Description", type = "textarea", order = 4)
    private String description;
}
