package com.hoang.basis.yukihon.system.admin.controller;

import com.hoang.basis.yukihon.system.admin.dto.MediaUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/media")
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class AdminMediaController {

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.media-upload-dir:uploads}")
    private String mediaUploadDir;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<MediaUploadResponse> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        String storedName = UUID.randomUUID() + extension;
        Path uploadDir = Paths.get(mediaUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);

        Path destination = uploadDir.resolve(storedName).normalize();
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(MediaUploadResponse.builder()
                .url(baseUrl + "/uploads/" + storedName)
                .filename(storedName)
                .contentType(file.getContentType())
                .size(file.getSize())
                .build());
    }
}
