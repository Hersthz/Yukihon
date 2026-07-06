package com.hoang.basis.yukihon.system.library.entity;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A content block inside a flashcard side: a labelled field of TEXT/IMAGE/AUDIO/VIDEO/CLOZE. */
@Entity
@Table(
        name = "flashcard_side_contents",
        indexes = @Index(name = "idx_flashcard_side_contents_side", columnList = "side_id"))
@Getter
@Setter
@NoArgsConstructor
public class FlashcardSideContent extends BaseEntity {

    @Column(name = "side_id", nullable = false)
    private Long sideId;

    /** Field label shown to the learner (e.g. "Cách đọc", "Onyomi", "Nghĩa"); null for plain cards. */
    @Column(name = "label", length = 100)
    private String label;

    /** TEXT | IMAGE | AUDIO | VIDEO | CLOZE */
    @Column(name = "content_type", nullable = false, length = 20)
    private String contentType = "TEXT";

    @Column(name = "content_value", columnDefinition = "LONGTEXT")
    private String contentValue;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "metadata", columnDefinition = "LONGTEXT")
    private String metadata;
}
