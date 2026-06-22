package com.hoang.basis.yukihon.system.storymode.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.storymode.dto.StoryModeStoryDto;
import com.hoang.basis.yukihon.system.storymode.dto.StoryModeStoryRequest;
import com.hoang.basis.yukihon.system.storymode.entity.StoryModeStory;
import com.hoang.basis.yukihon.system.storymode.repository.StoryModeStoryRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoryModeService {

    private final StoryModeStoryRepository storyModeStoryRepository;
    private final ObjectMapper objectMapper;

    public List<StoryModeStoryDto> getPublishedStories() {
        return storyModeStoryRepository.findByPublishedTrueOrderByUpdatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    public List<StoryModeStoryDto> getAdminStories() {
        return storyModeStoryRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    public StoryModeStoryDto getAdminStory(Long id) {
        return toDto(findStoryOrThrow(id));
    }

    @Transactional
    public StoryModeStoryDto createStory(StoryModeStoryRequest request) {
        StoryModeStory story = StoryModeStory.builder()
                .storyKey(normalizeStoryKey(request.getStoryKey()))
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .description(request.getDescription())
                .jlptLevel(request.getJlptLevel())
                .estimatedMinutes(request.getEstimatedMinutes() != null ? request.getEstimatedMinutes() : 10)
                .tone(request.getTone())
                .coverLabel(request.getCoverLabel())
                .entrySegmentId(request.getEntrySegmentId())
                .published(request.isPublished())
                .contentJson(writeSegments(request.getSegments()))
                .build();
        return toDto(storyModeStoryRepository.save(story));
    }

    @Transactional
    public StoryModeStoryDto updateStory(Long id, StoryModeStoryRequest request) {
        StoryModeStory story = findStoryOrThrow(id);
        story.setStoryKey(normalizeStoryKey(request.getStoryKey()));
        story.setTitle(request.getTitle());
        story.setSubtitle(request.getSubtitle());
        story.setDescription(request.getDescription());
        story.setJlptLevel(request.getJlptLevel());
        story.setEstimatedMinutes(request.getEstimatedMinutes() != null ? request.getEstimatedMinutes() : 10);
        story.setTone(request.getTone());
        story.setCoverLabel(request.getCoverLabel());
        story.setEntrySegmentId(request.getEntrySegmentId());
        story.setPublished(request.isPublished());
        story.setContentJson(writeSegments(request.getSegments()));
        return toDto(storyModeStoryRepository.save(story));
    }

    @Transactional
    public void deleteStory(Long id) {
        storyModeStoryRepository.delete(findStoryOrThrow(id));
    }

    private StoryModeStory findStoryOrThrow(Long id) {
        return storyModeStoryRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story mode story not found"));
    }

    private StoryModeStoryDto toDto(StoryModeStory story) {
        return StoryModeStoryDto.builder()
                .id(story.getId())
                .storyKey(story.getStoryKey())
                .title(story.getTitle())
                .subtitle(story.getSubtitle())
                .description(story.getDescription())
                .jlptLevel(story.getJlptLevel())
                .estimatedMinutes(story.getEstimatedMinutes())
                .tone(story.getTone())
                .coverLabel(story.getCoverLabel())
                .entrySegmentId(story.getEntrySegmentId())
                .published(story.isPublished())
                .segments(readSegments(story.getContentJson()))
                .createdAt(story.getCreatedAt())
                .updatedAt(story.getUpdatedAt())
                .build();
    }

    private List<StoryModeStoryDto.SegmentDto> readSegments(String contentJson) {
        if (contentJson == null || contentJson.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(contentJson, new TypeReference<>() {});
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private String writeSegments(List<StoryModeStoryDto.SegmentDto> segments) {
        try {
            return objectMapper.writeValueAsString(segments != null ? segments : new ArrayList<>());
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid story content", exception);
        }
    }

    private String normalizeStoryKey(String storyKey) {
        return storyKey.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
