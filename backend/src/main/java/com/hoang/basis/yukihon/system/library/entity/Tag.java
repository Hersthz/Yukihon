package com.hoang.basis.yukihon.system.library.entity;

import com.hoang.basis.yukihon.base.annotation.AutoCrud;
import com.hoang.basis.yukihon.base.annotation.EntityLabel;
import com.hoang.basis.yukihon.base.annotation.FieldMeta;
import com.hoang.basis.yukihon.base.annotation.ResourcePermission;
import com.hoang.basis.yukihon.base.annotation.Searchable;
import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A tag for organizing decks. userId null means a global/system tag. */
@Entity
@Table(
        name = "tags",
        indexes = {
            @Index(name = "idx_tags_user", columnList = "user_id"),
            @Index(name = "idx_tags_name", columnList = "name")
        })
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "deck-tags")
@ResourcePermission("TAG")
@EntityLabel(name = "Tag", plural = "Tags", description = "Tags for organizing decks")
@Searchable(fields = {"name"})
public class Tag extends BaseEntity {

    @Column(name = "user_id")
    @FieldMeta(label = "User ID", type = "number", order = 1)
    private Long userId;

    @Column(name = "name", nullable = false, columnDefinition = "VARCHAR(100)")
    @FieldMeta(label = "Name", required = true, order = 2)
    private String name;

    @Column(name = "color", length = 30)
    @FieldMeta(label = "Color", order = 3, placeholder = "#3b82f6")
    private String color;
}
