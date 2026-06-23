package com.hoang.basis.yukihon.system.library.entity;

import com.hoang.basis.yukihon.base.annotation.AutoCrud;
import com.hoang.basis.yukihon.base.annotation.EntityLabel;
import com.hoang.basis.yukihon.base.annotation.FieldMeta;
import com.hoang.basis.yukihon.base.annotation.ResourcePermission;
import com.hoang.basis.yukihon.base.annotation.Searchable;
import com.hoang.basis.yukihon.base.annotation.SoftDelete;
import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A user folder grouping decks. */
@Entity
@Table(name = "folders", indexes = @Index(name = "idx_folders_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "folders")
@SoftDelete
@ResourcePermission("FOLDER")
@EntityLabel(name = "Folder", plural = "Folders", description = "User folders that group decks")
@Searchable(fields = {"name", "description"})
public class Folder extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    @FieldMeta(label = "User ID", type = "number", required = true, order = 1)
    private Long userId;

    @Column(name = "name", nullable = false, columnDefinition = "VARCHAR(150)")
    @FieldMeta(label = "Name", required = true, order = 2)
    private String name;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Description", type = "textarea", order = 3)
    private String description;
}
