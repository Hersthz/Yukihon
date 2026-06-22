package com.hoang.basis.yukihon.system.srs.entity;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Per (user, deck) SRS preferences. When absent, the engine uses built-in defaults. */
@Entity
@Table(
        name = "anki_srs_settings",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_anki_setting_user_deck",
                        columnNames = {"user_id", "deck_id"}))
@Getter
@Setter
@NoArgsConstructor
public class AnkiSrsSetting extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "algorithm_config_id")
    private Long algorithmConfigId;

    @Column(name = "target_retention")
    private Double targetRetention = 0.9;

    @Column(name = "max_reviews_per_day")
    private Integer maxReviewsPerDay = 200;

    @Column(name = "max_items_per_day")
    private Integer maxItemsPerDay = 20;

    @Column(name = "maximum_interval_days")
    private Integer maximumIntervalDays = 36500;

    @Column(name = "suspend_leeches", nullable = false)
    private Boolean suspendLeeches = true;

    @Column(name = "leech_threshold", nullable = false)
    private Integer leechThreshold = 8;
}
