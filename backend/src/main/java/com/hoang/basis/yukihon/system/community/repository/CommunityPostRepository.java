package com.hoang.basis.yukihon.system.community.repository;

import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<CommunityPost> findByJlptLevelOrderByCreatedAtDesc(String jlptLevel, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query(
            """
            SELECT p FROM CommunityPost p
            WHERE (:category IS NULL OR p.category = :category)
              AND (:jlptLevel IS NULL OR p.jlptLevel = :jlptLevel)
              AND (
                    :search IS NULL
                    OR LOWER(COALESCE(p.title, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.tags, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            ORDER BY p.createdAt DESC
            """)
    Page<CommunityPost> searchPosts(
            @Param("category") String category,
            @Param("jlptLevel") String jlptLevel,
            @Param("search") String search,
            Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query(
            value =
                    """
                    SELECT pb.post FROM PostBookmark pb
                    WHERE pb.user.id = :userId
                      AND (:category IS NULL OR pb.post.category = :category)
                      AND (:jlptLevel IS NULL OR pb.post.jlptLevel = :jlptLevel)
                      AND (
                            :search IS NULL
                            OR LOWER(COALESCE(pb.post.title, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR LOWER(pb.post.content) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR LOWER(COALESCE(pb.post.tags, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                          )
                    ORDER BY pb.createdAt DESC
                    """,
            countQuery =
                    """
                    SELECT COUNT(pb) FROM PostBookmark pb
                    WHERE pb.user.id = :userId
                      AND (:category IS NULL OR pb.post.category = :category)
                      AND (:jlptLevel IS NULL OR pb.post.jlptLevel = :jlptLevel)
                      AND (
                            :search IS NULL
                            OR LOWER(COALESCE(pb.post.title, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR LOWER(pb.post.content) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR LOWER(COALESCE(pb.post.tags, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                          )
                    """)
    Page<CommunityPost> findBookmarkedPostsByUserId(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("jlptLevel") String jlptLevel,
            @Param("search") String search,
            Pageable pageable);

    long countByUserId(Long userId);
}
