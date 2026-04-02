package com.hoang.basis.yukihon.system.creatormode.repository;

import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CreatorTemplateRepository extends JpaRepository<CreatorTemplate, Long> {

    List<CreatorTemplate> findAllByOrderByUpdatedAtDesc();

    List<CreatorTemplate> findByStatusOrderByUpdatedAtDesc(CreatorTemplate.TemplateStatus status);

    List<CreatorTemplate> findByStatusInOrderByUpdatedAtDesc(Collection<CreatorTemplate.TemplateStatus> statuses);

    List<CreatorTemplate> findByContentTypeOrderByUpdatedAtDesc(CreatorTemplate.ContentType contentType);

    List<CreatorTemplate> findByStatusAndContentTypeOrderByUpdatedAtDesc(
            CreatorTemplate.TemplateStatus status,
            CreatorTemplate.ContentType contentType
    );

    long countByStatus(CreatorTemplate.TemplateStatus status);

    long countByContentType(CreatorTemplate.ContentType contentType);

    List<CreatorTemplate> findTop8ByUsageCountGreaterThanOrderByAverageScoreDescUsageCountDesc(Integer usageCount);
}
