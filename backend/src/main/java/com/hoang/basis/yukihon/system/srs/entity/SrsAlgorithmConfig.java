package com.hoang.basis.yukihon.system.srs.entity;

import com.hoang.basis.yukihon.base.annotation.AutoCrud;
import com.hoang.basis.yukihon.base.annotation.EntityLabel;
import com.hoang.basis.yukihon.base.annotation.FieldMeta;
import com.hoang.basis.yukihon.base.annotation.ResourceMenu;
import com.hoang.basis.yukihon.base.annotation.ResourcePermission;
import com.hoang.basis.yukihon.base.annotation.Searchable;
import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A reusable SRS algorithm preset (SM2 / FSRS / CUSTOM) with knobs stored as JSON. */
@Entity
@Table(name = "srs_algorithm_configs",
        uniqueConstraints = @UniqueConstraint(name = "uk_srs_config_code", columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "srs-algorithm-configs")
@ResourcePermission("SRS_ALGORITHM_CONFIG")
@ResourceMenu(title = "SRS Algorithms", group = "Library", icon = "settings", url = "/admin/srs-algorithm-configs", order = 20, permission = "SRS_ALGORITHM_CONFIG_READ")
@EntityLabel(name = "SRS Algorithm Config", plural = "SRS Algorithm Configs", description = "Reusable SRS algorithm presets")
@Searchable(fields = {"code", "name"})
public class SrsAlgorithmConfig extends BaseEntity {

    @Column(name = "code", nullable = false, length = 100)
    @FieldMeta(label = "Code", required = true, order = 1, placeholder = "SM2_DEFAULT")
    private String code;

    @Column(name = "name", nullable = false, columnDefinition = "NVARCHAR(255)")
    @FieldMeta(label = "Name", required = true, order = 2)
    private String name;

    @Column(name = "algorithm_type", nullable = false, length = 20)
    @FieldMeta(label = "Algorithm Type", type = "select", order = 3, enumValues = {"SM2", "FSRS", "CUSTOM"})
    private String algorithmType = "SM2";

    @Column(name = "config_json", columnDefinition = "NVARCHAR(MAX)")
    @FieldMeta(label = "Config JSON", type = "textarea", order = 4)
    private String configJson;

    @Column(name = "enabled", nullable = false)
    @FieldMeta(label = "Enabled", type = "boolean", order = 5)
    private Boolean enabled = true;
}
