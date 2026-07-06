package com.hoang.basis.yukihon.system.library.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.admin.dto.MediaUploadResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Media upload for any authenticated user (card images/audio). Stores under the media dir. */
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private static final long MAX_BYTES = 8L * 1024 * 1024; // 8 MB

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.media-upload-dir:uploads}")
    private String mediaUploadDir;

    @PostMapping("/upload")
    public ResponseEntity<MediaUploadResponse> upload(
            @RequestParam("file") MultipartFile file, @CurrentUserId Long userId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File rỗng");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File quá lớn (tối đa 8MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.startsWith("image/") || contentType.startsWith("audio/"))) {
            throw new IllegalArgumentException("Chỉ chấp nhận ảnh hoặc âm thanh");
        }

        String originalName =
                StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        int dot = originalName.lastIndexOf('.');
        String extension = dot >= 0 ? originalName.substring(dot) : "";
        String storedName = UUID.randomUUID() + extension;

        Path uploadDir = Paths.get(mediaUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);
        Files.copy(
                file.getInputStream(), uploadDir.resolve(storedName).normalize(), StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(MediaUploadResponse.builder()
                .url(baseUrl + "/uploads/" + storedName)
                .filename(storedName)
                .contentType(contentType)
                .size(file.getSize())
                .build());
    }
}
