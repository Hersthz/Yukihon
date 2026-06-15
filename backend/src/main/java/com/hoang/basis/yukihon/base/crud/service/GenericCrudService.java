package com.hoang.basis.yukihon.base.crud.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.base.crud.registry.CrudDescriptor;
import com.hoang.basis.yukihon.base.event.EntityChangeType;
import com.hoang.basis.yukihon.base.event.EntityChangedEvent;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Reflection-driven CRUD backed by {@link SimpleJpaRepository}. One service handles every
 * registered {@link CrudDescriptor}; no per-entity Spring bean is needed.
 */
@Service
@RequiredArgsConstructor
public class GenericCrudService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    @SuppressWarnings({"unchecked", "rawtypes"})
    private SimpleJpaRepository<Object, Long> repositoryFor(CrudDescriptor descriptor) {
        return new SimpleJpaRepository(descriptor.getEntityClass(), entityManager);
    }

    @Transactional(readOnly = true)
    public Page<Object> list(CrudDescriptor descriptor, String search, Pageable pageable) {
        Specification<Object> spec = buildSpecification(descriptor, search);
        return repositoryFor(descriptor).findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Object get(CrudDescriptor descriptor, Long id) {
        Object entity = repositoryFor(descriptor).findById(id)
                .orElseThrow(() -> notFound(descriptor, id));
        if (isSoftDeleted(descriptor, entity)) {
            throw notFound(descriptor, id);
        }
        return entity;
    }

    @Transactional
    public Object create(CrudDescriptor descriptor, JsonNode payload) {
        Object entity;
        try {
            entity = objectMapper.treeToValue(payload, descriptor.getEntityClass());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid payload for " + descriptor.getPath() + ": " + e.getMessage());
        }
        clearIdentity(entity);
        Object saved = repositoryFor(descriptor).save(entity);
        publish(descriptor, saved, EntityChangeType.CREATED);
        return saved;
    }

    @Transactional
    public Object update(CrudDescriptor descriptor, Long id, JsonNode payload) {
        SimpleJpaRepository<Object, Long> repository = repositoryFor(descriptor);
        Object existing = repository.findById(id).orElseThrow(() -> notFound(descriptor, id));
        if (isSoftDeleted(descriptor, existing)) {
            throw notFound(descriptor, id);
        }
        try {
            objectMapper.readerForUpdating(existing).readValue(payload);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid payload for " + descriptor.getPath() + ": " + e.getMessage());
        }
        Object saved = repository.save(existing);
        publish(descriptor, saved, EntityChangeType.UPDATED);
        return saved;
    }

    @Transactional
    public void delete(CrudDescriptor descriptor, Long id) {
        SimpleJpaRepository<Object, Long> repository = repositoryFor(descriptor);
        Object existing = repository.findById(id).orElseThrow(() -> notFound(descriptor, id));
        if (descriptor.supportsSoftDelete()) {
            setBooleanProperty(existing, "isDeleted", true);
            repository.save(existing);
        } else {
            repository.delete(existing);
        }
        publish(descriptor, existing, EntityChangeType.DELETED);
    }

    @Transactional
    public void bulkDelete(CrudDescriptor descriptor, List<Long> ids) {
        for (Long id : ids) {
            delete(descriptor, id);
        }
    }

    // --- helpers -------------------------------------------------------------

    private Specification<Object> buildSpecification(CrudDescriptor descriptor, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (descriptor.supportsSoftDelete()) {
                predicates.add(cb.isFalse(root.get("isDeleted")));
            }

            if (StringUtils.hasText(search) && !descriptor.getSearchableFields().isEmpty()) {
                String like = "%" + search.toLowerCase() + "%";
                List<Predicate> ors = new ArrayList<>();
                for (String field : descriptor.getSearchableFields()) {
                    ors.add(cb.like(cb.lower(root.get(field).as(String.class)), like));
                }
                predicates.add(cb.or(ors.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void publish(CrudDescriptor descriptor, Object entity, EntityChangeType type) {
        Long id = asLong(tryGet(entity, "id"));
        String snapshot = null;
        try {
            snapshot = objectMapper.writeValueAsString(entity);
        } catch (Exception ignored) {
            // entity not serializable (e.g. lazy proxies); record without snapshot
        }
        eventPublisher.publishEvent(new EntityChangedEvent(
                descriptor.getEntityClass(),
                descriptor.getEntityClass().getSimpleName(),
                id,
                type,
                snapshot,
                currentActor()
        ));
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return "system";
        }
        return authentication.getName();
    }

    private Long asLong(Object value) {
        return value instanceof Number number ? number.longValue() : null;
    }

    private void clearIdentity(Object entity) {
        // Ensure Hibernate treats the entity as new (persist, not merge).
        trySet(entity, "id", null);
        trySet(entity, "version", null);
    }

    private boolean isSoftDeleted(CrudDescriptor descriptor, Object entity) {
        if (!descriptor.supportsSoftDelete()) {
            return false;
        }
        Object value = tryGet(entity, "isDeleted");
        return Boolean.TRUE.equals(value);
    }

    private void setBooleanProperty(Object entity, String property, boolean value) {
        trySet(entity, property, value);
    }

    private void trySet(Object target, String property, Object value) {
        var pd = BeanUtils.getPropertyDescriptor(target.getClass(), property);
        if (pd != null && pd.getWriteMethod() != null) {
            try {
                pd.getWriteMethod().invoke(target, value);
            } catch (Exception ignored) {
                // property not settable on this entity; ignore
            }
        }
    }

    private Object tryGet(Object target, String property) {
        var pd = BeanUtils.getPropertyDescriptor(target.getClass(), property);
        if (pd != null && pd.getReadMethod() != null) {
            try {
                return pd.getReadMethod().invoke(target);
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private ResourceNotFoundException notFound(CrudDescriptor descriptor, Long id) {
        return new ResourceNotFoundException(descriptor.getLabel() + " not found: " + id);
    }
}
