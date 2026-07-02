package com.hoang.basis.yukihon.system.dictionary.dto;

import java.time.LocalDateTime;

/** A community contribution with vote counts and the current user's own vote (-1/0/1). */
public record DictContributionDto(
        Long id,
        String headword,
        String type,
        String content,
        String translation,
        Long userId,
        String userDisplayName,
        Integer upvotes,
        Integer downvotes,
        Integer myVote,
        boolean mine,
        LocalDateTime createdAt) {}
