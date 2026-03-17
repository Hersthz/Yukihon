package com.hoang.basis.yukihon.system.translation.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity lưu lịch sử dịch thuật của user.
 * Giúp user xem lại các bản dịch đã tra và hỗ trợ cải thiện từ vựng.
 */
@Entity
@Table(name = "translation_history",
        indexes = {
                @Index(name = "idx_trans_user_id", columnList = "user_id"),
                @Index(name = "idx_trans_created_at", columnList = "created_at"),
                @Index(name = "idx_trans_source_lang", columnList = "source_lang"),
                @Index(name = "idx_trans_target_lang", columnList = "target_lang")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "source_lang", nullable = false, length = 10)
    private String sourceLang;

    @Column(name = "target_lang", nullable = false, length = 10)
    private String targetLang;

    @Column(name = "source_text", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String sourceText;

    @Column(name = "translated_text", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String translatedText;

    /** Đánh dấu bản dịch yêu thích để ôn tập */
    @Builder.Default
    @Column(nullable = false)
    private boolean bookmarked = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
