package com.hoang.basis.yukihon.system.community.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity
@Table(
        name = "community_posts",
        indexes = {
            @Index(name = "idx_post_user", columnList = "user_id"),
            @Index(name = "idx_post_created", columnList = "created_at")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(length = 50)
    private String category; // GENERAL, QUESTION, TIP, RESOURCE, ACHIEVEMENT

    @Column(length = 20)
    private String jlptLevel; // optional tag

    @Builder.Default
    @Column(nullable = false)
    private int likeCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private int commentCount = 0;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 500)
    private String tags;

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
