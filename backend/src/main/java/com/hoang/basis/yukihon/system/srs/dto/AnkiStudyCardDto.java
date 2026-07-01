package com.hoang.basis.yukihon.system.srs.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

/** A single study card returned to the frontend: content + current SRS state + 4-button previews. */
@Data
@Builder
public class AnkiStudyCardDto {

    private Long flashcardId;
    private String side; // FORWARD | REVERSE
    private String front;
    private String back;
    private String hint;
    private String explanation;
    private String imageUrl;
    private String audioUrl;

    private Long progressId;
    private String state;
    private Double easeFactor;
    private Integer intervalDays;
    private Integer reviewCount;
    private Integer lapses;
    private Double memoryScore;
    private LocalDateTime nextReviewAt;

    private String againPreview;
    private String hardPreview;
    private String goodPreview;
    private String easyPreview;
}
