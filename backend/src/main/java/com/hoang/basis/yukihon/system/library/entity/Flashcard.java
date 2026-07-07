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

/**
 * The display layer of a learning item. The actual learning item is referenced polymorphically via
 * itemType + itemId (WORD, VOCAB, KANJI, GRAMMAR, SENTENCE) so existing content can become cards
 * without copying. front/back/hint/explanation hold the rendered text; media via url fields.
 */
@Entity
@Table(
        name = "flashcards",
        indexes = {
            @Index(name = "idx_flashcards_item", columnList = "item_type,item_id"),
            @Index(name = "idx_flashcards_card_type", columnList = "card_type")
        })
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "flashcards")
@SoftDelete
@ResourcePermission("FLASHCARD")
@EntityLabel(name = "Flashcard", plural = "Flashcards", description = "Display cards backing learning items")
@Searchable(fields = {"front", "back"})
public class Flashcard extends BaseEntity {

    @Column(name = "card_type", nullable = false, length = 20)
    @FieldMeta(
            label = "Card Type",
            type = "select",
            order = 1,
            enumValues = {"BASIC", "IMAGE", "AUDIO", "CLOZE"})
    private String cardType = "BASIC";

    /**
     * Study template: how many cards this note produces. FORWARD = front→back only;
     * FORWARD_REVERSE = both front→back and back→front (each with its own SRS progress).
     */
    @Column(name = "template", nullable = false, length = 20)
    @FieldMeta(
            label = "Template",
            type = "select",
            order = 10,
            enumValues = {"FORWARD", "FORWARD_REVERSE"})
    private String template = "FORWARD";

    @Column(name = "item_type", length = 30)
    @FieldMeta(
            label = "Item Type",
            type = "select",
            order = 2,
            enumValues = {"WORD", "VOCAB", "KANJI", "GRAMMAR", "SENTENCE", "GENERIC"})
    private String itemType = "GENERIC";

    @Column(name = "item_id")
    @FieldMeta(label = "Item ID", type = "number", order = 3)
    private Long itemId;

    @Column(name = "front", nullable = false, columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Front", type = "textarea", required = true, order = 4)
    private String front;

    @Column(name = "back", nullable = false, columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Back", type = "textarea", required = true, order = 5)
    private String back;

    @Column(name = "hint", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Hint", type = "textarea", order = 6)
    private String hint;

    @Column(name = "explanation", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Explanation", type = "textarea", order = 7)
    private String explanation;

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Image URL", order = 8)
    private String imageUrl;

    @Column(name = "audio_url", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Audio URL", order = 9)
    private String audioUrl;

    /** Comma-separated free-text tags for filtering/organising (e.g. "N5, động từ"). */
    @Column(name = "tags", columnDefinition = "LONGTEXT")
    @FieldMeta(label = "Tags", order = 11)
    private String tags;
}
