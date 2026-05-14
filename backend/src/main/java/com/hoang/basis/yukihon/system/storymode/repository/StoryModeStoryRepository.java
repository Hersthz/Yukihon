package com.hoang.basis.yukihon.system.storymode.repository;

import com.hoang.basis.yukihon.system.storymode.entity.StoryModeStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoryModeStoryRepository extends JpaRepository<StoryModeStory, Long> {

    List<StoryModeStory> findAllByOrderByUpdatedAtDesc();

    List<StoryModeStory> findByPublishedTrueOrderByUpdatedAtDesc();

    Optional<StoryModeStory> findByStoryKey(String storyKey);
}
