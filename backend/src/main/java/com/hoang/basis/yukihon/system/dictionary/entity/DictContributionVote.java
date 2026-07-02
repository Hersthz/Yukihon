package com.hoang.basis.yukihon.system.dictionary.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One user's vote (+1 / -1) on a contribution. Unique per (contribution, user). */
@Entity
@Table(
        name = "dict_contribution_vote",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_dict_vote",
                        columnNames = {"contribution_id", "user_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictContributionVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contribution_id", nullable = false)
    private Long contributionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** +1 upvote, -1 downvote. */
    @Column(nullable = false)
    private Integer value;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
