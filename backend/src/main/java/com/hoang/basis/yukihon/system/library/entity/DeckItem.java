package com.hoang.basis.yukihon.system.library.entity;

import com.hoang.basis.yukihon.base.annotation.AutoCrud;
import com.hoang.basis.yukihon.base.annotation.EntityLabel;
import com.hoang.basis.yukihon.base.annotation.FieldMeta;
import com.hoang.basis.yukihon.base.annotation.ResourcePermission;
import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Join between a deck and a flashcard, with ordering. */
@Entity
@Table(
        name = "deck_items",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_deck_item",
                        columnNames = {"deck_id", "flashcard_id"}),
        indexes = {
            @Index(name = "idx_deck_items_deck", columnList = "deck_id"),
            @Index(name = "idx_deck_items_flashcard", columnList = "flashcard_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "deck-items")
@ResourcePermission("DECK_ITEM")
@EntityLabel(name = "Deck Item", plural = "Deck Items", description = "Flashcards placed in a deck")
public class DeckItem extends BaseEntity {

    @Column(name = "deck_id", nullable = false)
    @FieldMeta(label = "Deck ID", type = "number", required = true, order = 1)
    private Long deckId;

    @Column(name = "flashcard_id", nullable = false)
    @FieldMeta(label = "Flashcard ID", type = "number", required = true, order = 2)
    private Long flashcardId;

    @Column(name = "order_index", nullable = false)
    @FieldMeta(label = "Order", type = "number", order = 3)
    private Integer orderIndex = 0;
}
