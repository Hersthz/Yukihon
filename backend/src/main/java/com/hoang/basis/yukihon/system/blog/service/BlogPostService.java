package com.hoang.basis.yukihon.system.blog.service;

import com.hoang.basis.yukihon.system.blog.dto.BlogPostDto;
import com.hoang.basis.yukihon.system.blog.dto.BlogPostRequest;
import com.hoang.basis.yukihon.system.blog.entity.BlogPost;
import com.hoang.basis.yukihon.system.blog.repository.BlogPostRepository;
import java.text.Normalizer;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;

    @Transactional(readOnly = true)
    public List<BlogPostDto> getAll() {
        return blogPostRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BlogPostDto> getPublished() {
        return blogPostRepository.findPublished().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BlogPostDto getById(Long id) {
        return blogPostRepository
                .findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Blog post not found: " + id));
    }

    @Transactional(readOnly = true)
    public BlogPostDto getBySlug(String slug) {
        return blogPostRepository
                .findBySlug(slug)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Blog post not found: " + slug));
    }

    public BlogPostDto create(BlogPostRequest req) {
        String slug = resolveSlug(req.getSlug(), req.getTitle());
        BlogPost post = BlogPost.builder()
                .title(req.getTitle())
                .slug(slug)
                .excerpt(req.getExcerpt())
                .content(req.getContent())
                .coverImageUrl(req.getCoverImageUrl())
                .tags(joinTags(req.getTags()))
                .authorName(req.getAuthorName())
                .status(parseStatus(req.getStatus()))
                .build();

        if (post.getStatus() == BlogPost.BlogPostStatus.PUBLISHED) {
            post.setPublishedAt(Instant.now());
        }

        BlogPost saved = blogPostRepository.save(post);
        log.info("Created blog post id={} slug={}", saved.getId(), saved.getSlug());
        return toDto(saved);
    }

    public BlogPostDto update(Long id, BlogPostRequest req) {
        BlogPost post =
                blogPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Blog post not found: " + id));

        post.setTitle(req.getTitle());
        if (req.getSlug() != null && !req.getSlug().isBlank()) {
            String newSlug = slugify(req.getSlug());
            if (!newSlug.equals(post.getSlug()) && blogPostRepository.existsBySlug(newSlug)) {
                throw new RuntimeException("Slug already in use: " + newSlug);
            }
            post.setSlug(newSlug);
        }
        post.setExcerpt(req.getExcerpt());
        post.setContent(req.getContent());
        post.setCoverImageUrl(req.getCoverImageUrl());
        post.setTags(joinTags(req.getTags()));
        post.setAuthorName(req.getAuthorName());

        BlogPost.BlogPostStatus newStatus = parseStatus(req.getStatus());
        if (newStatus == BlogPost.BlogPostStatus.PUBLISHED && post.getStatus() != BlogPost.BlogPostStatus.PUBLISHED) {
            post.setPublishedAt(Instant.now());
        }
        post.setStatus(newStatus);

        BlogPost saved = blogPostRepository.save(post);
        log.info("Updated blog post id={}", saved.getId());
        return toDto(saved);
    }

    public void delete(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new RuntimeException("Blog post not found: " + id);
        }
        blogPostRepository.deleteById(id);
        log.info("Deleted blog post id={}", id);
    }

    private BlogPostDto toDto(BlogPost p) {
        return BlogPostDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .excerpt(p.getExcerpt())
                .content(p.getContent())
                .coverImageUrl(p.getCoverImageUrl())
                .tags(parseTags(p.getTags()))
                .authorName(p.getAuthorName())
                .status(p.getStatus().name())
                .publishedAt(p.getPublishedAt() != null ? p.getPublishedAt().toString() : null)
                .createdAt(p.getCreatedAt().toString())
                .updatedAt(p.getUpdatedAt().toString())
                .build();
    }

    private String resolveSlug(String requestedSlug, String title) {
        String base = (requestedSlug != null && !requestedSlug.isBlank()) ? requestedSlug : title;
        String slug = slugify(base);
        if (!blogPostRepository.existsBySlug(slug)) {
            return slug;
        }
        // append numeric suffix until unique
        int i = 2;
        while (blogPostRepository.existsBySlug(slug + "-" + i)) {
            i++;
        }
        return slug + "-" + i;
    }

    private String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return normalized
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
    }

    private BlogPost.BlogPostStatus parseStatus(String status) {
        if (status == null) return BlogPost.BlogPostStatus.DRAFT;
        try {
            return BlogPost.BlogPostStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return BlogPost.BlogPostStatus.DRAFT;
        }
    }

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        return tags.stream()
                .map(String::trim)
                .filter(t -> !t.isBlank())
                .distinct()
                .collect(Collectors.joining(","));
    }

    private List<String> parseTags(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(t -> !t.isBlank())
                .collect(Collectors.toList());
    }
}
