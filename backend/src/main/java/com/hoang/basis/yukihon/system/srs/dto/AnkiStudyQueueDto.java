package com.hoang.basis.yukihon.system.srs.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

/** The study queue for a deck plus summary counters. */
@Data
@Builder
public class AnkiStudyQueueDto {

    private List<AnkiStudyCardDto> cards;
    private int totalNew;
    private int totalLearning;
    private int totalReview;
    private int dueReviewCards;
}
