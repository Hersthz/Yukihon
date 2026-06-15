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

/** A user's favorite deck. */
@Entity
@Table(name = "favorite_decks",
        uniqueConstraints = @UniqueConstraint(name = "uk_favorite_deck", columnNames = {"user_id", "deck_id"}),
        indexes = @Index(name = "idx_favorite_decks_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AutoCrud(path = "favorite-decks")
@ResourcePermission("FAVORITE_DECK")
@EntityLabel(name = "Favorite Deck", plural = "Favorite Decks", description = "Decks favorited by users")
public class FavoriteDeck extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    @FieldMeta(label = "User ID", type = "number", required = true, order = 1)
    private Long userId;

    @Column(name = "deck_id", nullable = false)
    @FieldMeta(label = "Deck ID", type = "number", required = true, order = 2)
    private Long deckId;
}
