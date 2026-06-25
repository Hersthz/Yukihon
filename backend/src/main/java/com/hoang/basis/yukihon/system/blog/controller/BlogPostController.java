package com.hoang.basis.yukihon.system.blog.controller;

import com.hoang.basis.yukihon.system.blog.dto.BlogPostDto;
import com.hoang.basis.yukihon.system.blog.dto.BlogPostRequest;
import com.hoang.basis.yukihon.system.blog.service.BlogPostService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class BlogPostController {

    private final BlogPostService blogPostService;

    /** Readable by any authenticated user (no extra permission needed) */
    @GetMapping("/published")
    public ResponseEntity<List<BlogPostDto>> getPublished() {
        return ResponseEntity.ok(blogPostService.getPublished());
    }

    @GetMapping("/published/{slug}")
    public ResponseEntity<BlogPostDto> getPublishedBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogPostService.getBySlug(slug));
    }

    /** Admin — requires CONTENT_READ/CONTENT_MANAGE */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<BlogPostDto>> getAll() {
        return ResponseEntity.ok(blogPostService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<BlogPostDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<BlogPostDto> create(@Valid @RequestBody BlogPostRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogPostService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<BlogPostDto> update(
            @PathVariable Long id, @Valid @RequestBody BlogPostRequest req) {
        return ResponseEntity.ok(blogPostService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        blogPostService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
