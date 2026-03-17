package com.hoang.basis.yukihon.system.userprogress.controller;

import com.hoang.basis.yukihon.system.userprogress.dto.UserProgressDto;
import com.hoang.basis.yukihon.system.userprogress.dto.UserProgressRequest;
import com.hoang.basis.yukihon.system.userprogress.service.UserProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class UserProgressController {

    private final UserProgressService userProgressService;

    @GetMapping
    public ResponseEntity<List<UserProgressDto>> getUserProgress(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Assuming user ID is available from security context
        // You may need to inject UserRepository and fetch user by email
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProgressDto> getProgressById(@PathVariable Long id) {
        return ResponseEntity.ok(userProgressService.getProgressById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserProgressDto>> getUserProgressById(@PathVariable Long userId) {
        List<UserProgressDto> progress = userProgressService.getUserProgress(userId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<UserProgressDto>> getUserProgressByStatus(
            @PathVariable Long userId,
            @PathVariable String status
    ) {
        List<UserProgressDto> progress = userProgressService.getUserProgressByStatus(userId, status);
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<UserProgressDto> createProgress(
            @PathVariable Long userId,
            @Valid @RequestBody UserProgressRequest request
    ) {
        UserProgressDto progress = userProgressService.createProgress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(progress);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProgressDto> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody UserProgressRequest request
    ) {
        UserProgressDto updated = userProgressService.updateProgress(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable Long id) {
        userProgressService.deleteProgress(id);
        return ResponseEntity.noContent().build();
    }
}
