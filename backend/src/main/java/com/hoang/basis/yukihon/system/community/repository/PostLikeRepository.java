package com.hoang.basis.yukihon.system.community.repository;

import com.hoang.basis.yukihon.system.community.entity.PostLike;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    @Query("SELECT pl.post.id FROM PostLike pl WHERE pl.user.id = :userId AND pl.post.id IN :postIds")
    List<Long> findLikedPostIdsByUserIdAndPostIds(
            @Param("userId") Long userId, @Param("postIds") Collection<Long> postIds);

    long countByPostId(Long postId);
}
