package com.hoang.basis.yukihon.system.library.entity;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One face of a flashcard (FRONT / BACK / HINT); holds ordered {@link FlashcardSideContent}. */
@Entity
@Table(
        name = "flashcard_sides",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_flashcard_side",
                        columnNames = {"flashcard_id", "side"}),
        indexes = @Index(name = "idx_flashcard_sides_flashcard", columnList = "flashcard_id"))
@Getter
@Setter
@NoArgsConstructor
public class FlashcardSide extends BaseEntity {

    @Column(name = "flashcard_id", nullable = false)
    private Long flashcardId;

    /** FRONT | BACK | HINT */
    @Column(name = "side", nullable = false, length = 10)
    private String side;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;
}
