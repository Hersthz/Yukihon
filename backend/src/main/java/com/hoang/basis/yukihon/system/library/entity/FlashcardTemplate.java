package com.hoang.basis.yukihon.system.library.entity;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A reusable card render template: HTML for front/back with {@code {{field}}} placeholders + CSS.
 * userId null = system template; deckId set = a copy bound to one deck.
 */
@Entity
@Table(
        name = "flashcard_templates",
        indexes = {
            @Index(name = "idx_flashcard_templates_owner", columnList = "user_id"),
            @Index(name = "idx_flashcard_templates_default", columnList = "is_default,card_type")
        })
@Getter
@Setter
@NoArgsConstructor
public class FlashcardTemplate extends BaseEntity {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "deck_id")
    private Long deckId;

    @Column(name = "card_type", nullable = false, length = 50)
    private String cardType = "BASIC";

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "front_template", columnDefinition = "LONGTEXT")
    private String frontTemplate;

    @Column(name = "back_template", columnDefinition = "LONGTEXT")
    private String backTemplate;

    @Column(name = "styling", columnDefinition = "LONGTEXT")
    private String styling;

    @Column(name = "builder_config_json", columnDefinition = "LONGTEXT")
    private String builderConfigJson;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "visibility", nullable = false, length = 20)
    private String visibility = "PRIVATE";
}
