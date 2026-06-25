package com.hoang.basis.yukihon.system.blog.repository;

import com.hoang.basis.yukihon.system.blog.entity.BlogPost;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' ORDER BY p.publishedAt DESC")
    List<BlogPost> findPublished();

    long countByStatus(BlogPost.BlogPostStatus status);
}
