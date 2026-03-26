package com.hoang.basis.yukihon.system.community.repository;

import com.hoang.basis.yukihon.system.community.entity.PostBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {

    Optional<PostBookmark> findByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    @Query("SELECT pb.post.id FROM PostBookmark pb WHERE pb.user.id = :userId AND pb.post.id IN :postIds")
    List<Long> findBookmarkedPostIdsByUserIdAndPostIds(
            @Param("userId") Long userId,
            @Param("postIds") Collection<Long> postIds
    );
}
