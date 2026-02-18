package com.hoang.basis.yukihon.repository;

import com.hoang.basis.yukihon.model.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<CommunityPost> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);

    Page<CommunityPost> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<CommunityPost> findByJlptLevelOrderByCreatedAtDesc(String jlptLevel, Pageable pageable);

    long countByUserId(Long userId);
}
