package com.hoang.basis.yukihon.system.library.entity;

import com.hoang.basis.yukihon.base.annotation.AuditEnabled;
import com.hoang.basis.yukihon.base.annotation.AutoCrud;
import com.hoang.basis.yukihon.base.annotation.EntityLabel;
import com.hoang.basis.yukihon.base.annotation.FieldMeta;
import com.hoang.basis.yukihon.base.annotation.Filterable;
import com.hoang.basis.yukihon.base.annotation.ResourceMenu;
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

/**
 * A study deck. The display container that holds flashcards (via deck_items). Owned by a user;
 * may be cloned from a public deck (originalDeckId).
 */
@Entity
@Table(
        name = "decks",
        indexes = {
            @Index(name = "idx_decks_user", columnList = "user_id"),
            @Index(name = "idx_decks_visibility", columnList = "visibility")
        })
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "decks")
@SoftDelete
@AuditEnabled
@ResourcePermission("DECK")
@ResourceMenu(
        title = "Decks",
        group = "Library",
        icon = "book",
        url = "/admin/decks",
        order = 10,
        permission = "DECK_READ")
@EntityLabel(name = "Deck", plural = "Decks", description = "Study decks containing flashcards")
@Searchable(fields = {"title", "description"})
@Filterable(fields = {"visibility", "userId"})
public class Deck extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    @FieldMeta(label = "User ID", type = "number", required = true, order = 1)
    private Long userId;

    @Column(name = "folder_id")
    @FieldMeta(label = "Folder ID", type = "number", order = 2)
    private Long folderId;

    @Column(name = "original_deck_id")
    @FieldMeta(label = "Cloned From Deck", type = "number", order = 3)
    private Long originalDeckId;

    @Column(name = "title", nullable = false, columnDefinition = "VARCHAR(200)")
    @FieldMeta(label = "Title", required = true, order = 4)
    private String title;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Description", type = "textarea", order = 5)
    private String description;

    @Column(name = "visibility", nullable = false, length = 20)
    @FieldMeta(
            label = "Visibility",
            type = "select",
            order = 6,
            enumValues = {"PRIVATE", "PUBLIC", "UNLISTED"})
    private String visibility = "PRIVATE";

    @Column(name = "cover_image_url", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Cover Image URL", order = 7)
    private String coverImageUrl;

    @Column(name = "source_language", length = 10)
    @FieldMeta(label = "Source Language", order = 8, placeholder = "ja")
    private String sourceLanguage = "ja";

    @Column(name = "target_language", length = 10)
    @FieldMeta(label = "Target Language", order = 9, placeholder = "vi")
    private String targetLanguage = "vi";

    @Column(name = "total_cards", nullable = false)
    @FieldMeta(label = "Total Cards", type = "number", order = 10, readOnly = true)
    private Integer totalCards = 0;

    @Column(name = "clone_count", nullable = false)
    @FieldMeta(label = "Clone Count", type = "number", order = 11, readOnly = true)
    private Integer cloneCount = 0;

    @Column(name = "favorite_count", nullable = false)
    @FieldMeta(label = "Favorite Count", type = "number", order = 12, readOnly = true)
    private Integer favoriteCount = 0;
}
