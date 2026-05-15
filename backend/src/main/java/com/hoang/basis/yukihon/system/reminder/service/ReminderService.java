package com.hoang.basis.yukihon.system.reminder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.kanjisrs.repository.KanjiSrsRecordRepository;
import com.hoang.basis.yukihon.system.savedword.repository.SavedWordRepository;
import com.hoang.basis.yukihon.system.storymode.repository.StoryModeStoryRepository;
import com.hoang.basis.yukihon.system.userprogress.entity.UserProgress;
import com.hoang.basis.yukihon.system.userprogress.repository.UserProgressRepository;
import com.hoang.basis.yukihon.system.reminder.dto.ReminderDto;
import com.hoang.basis.yukihon.system.reminder.dto.ReminderSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private static final long STORY_MODE_PROGRESS_VOCABULARY_ID = -1001L;

    private final SavedWordRepository savedWordRepository;
    private final KanjiSrsRecordRepository kanjiSrsRecordRepository;
    private final StoryModeStoryRepository storyModeStoryRepository;
    private final UserProgressRepository userProgressRepository;
    private final ObjectMapper objectMapper;

    public ReminderSummaryDto getSummary(Long userId) {
        Instant now = Instant.now();
        List<ReminderDto> items = new ArrayList<>();

        int dueWordCount = savedWordRepository
                .findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAscCreatedAtDesc(userId, now)
                .size();
        if (dueWordCount > 0) {
            items.add(ReminderDto.builder()
                    .id("my-words-due")
                    .type("MY_WORDS")
                    .priority(dueWordCount >= 10 ? "HIGH" : "MEDIUM")
                    .title("My Words cần ôn")
                    .description(dueWordCount + " mục trong sổ tay đã đến hạn review.")
                    .actionLabel("Mở review queue")
                    .actionPath("/my-words")
                    .count(dueWordCount)
                    .build());
        }

        int dueKanjiCount = kanjiSrsRecordRepository
                .findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAscCreatedAtDesc(userId, now)
                .size();
        if (dueKanjiCount > 0) {
            items.add(ReminderDto.builder()
                    .id("kanji-srs-due")
                    .type("KANJI_SRS")
                    .priority(dueKanjiCount >= 10 ? "HIGH" : "MEDIUM")
                    .title("Kanji SRS đến hạn")
                    .description(dueKanjiCount + " kanji đang chờ ôn lại.")
                    .actionLabel("Ôn Kanji")
                    .actionPath("/kanji-library")
                    .count(dueKanjiCount)
                    .build());
        }

        int unfinishedStoryCount = countUnfinishedStories(userId);
        if (unfinishedStoryCount > 0) {
            items.add(ReminderDto.builder()
                    .id("story-mode-unfinished")
                    .type("STORY_MODE")
                    .priority("LOW")
                    .title("StoryMode còn dang dở")
                    .description(unfinishedStoryCount + " story đã mở nhưng chưa hoàn thành.")
                    .actionLabel("Tiếp tục đọc")
                    .actionPath("/story-mode")
                    .count(unfinishedStoryCount)
                    .build());
        }

        long urgentCount = items.stream()
                .filter(item -> "HIGH".equals(item.getPriority()))
                .count();
        int totalCount = items.stream()
                .mapToInt(item -> item.getCount() != null ? item.getCount() : 1)
                .sum();

        return ReminderSummaryDto.builder()
                .totalCount(totalCount)
                .urgentCount((int) urgentCount)
                .items(items)
                .build();
    }

    private int countUnfinishedStories(Long userId) {
        UserProgress progress = userProgressRepository.findByUserIdAndVocabularyId(userId, STORY_MODE_PROGRESS_VOCABULARY_ID)
                .orElse(null);
        if (progress == null || progress.getNotes() == null || progress.getNotes().isBlank()) {
            return 0;
        }

        try {
            JsonNode root = objectMapper.readTree(progress.getNotes());
            JsonNode unlockedMap = root.path("unlockedSegmentIdsByStory");
            if (!unlockedMap.isObject()) {
                return 0;
            }

            return (int) storyModeStoryRepository.findByPublishedTrueOrderByUpdatedAtDesc().stream()
                    .filter(story -> {
                        JsonNode unlockedIds = unlockedMap.path(story.getStoryKey());
                        return unlockedIds.isArray() && unlockedIds.size() > 0 && unlockedIds.size() < readSegmentCount(story.getContentJson());
                    })
                    .count();
        } catch (Exception ignored) {
            return 0;
        }
    }

    private int readSegmentCount(String contentJson) {
        try {
            JsonNode segments = objectMapper.readTree(contentJson);
            return segments.isArray() ? segments.size() : 0;
        } catch (Exception ignored) {
            return 0;
        }
    }
}
