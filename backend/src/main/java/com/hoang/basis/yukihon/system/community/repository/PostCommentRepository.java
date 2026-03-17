package com.hoang.basis.yukihon.system.community.repository;

import com.hoang.basis.yukihon.system.community.entity.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    Page<PostComment> findByPostIdOrderByCreatedAtDesc(Long postId, Pageable pageable);

    long countByPostId(Long postId);
}
