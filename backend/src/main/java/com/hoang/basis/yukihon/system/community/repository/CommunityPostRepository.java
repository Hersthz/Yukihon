package com.hoang.basis.yukihon.system.community.repository;

import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findByJlptLevelOrderByCreatedAtDesc(String jlptLevel, Pageable pageable);

    long countByUserId(Long userId);
}
