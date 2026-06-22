package com.hoang.basis.yukihon.system.usersettings.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(
        name = "user_settings",
        uniqueConstraints = @UniqueConstraint(name = "uk_settings_user", columnNames = "user_id"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @Column(length = 20)
    private String theme = "dark";

    @Builder.Default
    @Column(length = 20)
    private String language = "vi"; // vi, en, ja

    @Builder.Default
    @Column(nullable = false)
    private int dailyGoalMinutes = 15;

    @Builder.Default
    @Column(nullable = false)
    private boolean emailNotifications = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean pushNotifications = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean showFurigana = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean showRomaji = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean autoPlayAudio = true;

    @Builder.Default
    @Column(length = 20)
    private String quizDifficulty = "normal"; // easy, normal, hard

    @Builder.Default
    @Column(length = 10)
    private String targetJlptLevel = "N5";

    @Column(name = "jlpt_deadline_date")
    private LocalDate jlptDeadlineDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
