package com.hoang.basis.yukihon.system.creatormode.repository;

import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreatorTemplateRepository extends JpaRepository<CreatorTemplate, Long> {

    List<CreatorTemplate> findAllByOrderByUpdatedAtDesc();

    List<CreatorTemplate> findByStatusOrderByUpdatedAtDesc(CreatorTemplate.TemplateStatus status);

    List<CreatorTemplate> findByContentTypeOrderByUpdatedAtDesc(CreatorTemplate.ContentType contentType);

    List<CreatorTemplate> findByStatusAndContentTypeOrderByUpdatedAtDesc(
            CreatorTemplate.TemplateStatus status,
            CreatorTemplate.ContentType contentType
    );

    Optional<CreatorTemplate> findByIdAndCreatedByUserId(Long id, Long createdByUserId);

    long countByStatus(CreatorTemplate.TemplateStatus status);

    long countByContentType(CreatorTemplate.ContentType contentType);

    List<CreatorTemplate> findTop8ByUsageCountGreaterThanOrderByAverageScoreDescUsageCountDesc(Integer usageCount);
}
