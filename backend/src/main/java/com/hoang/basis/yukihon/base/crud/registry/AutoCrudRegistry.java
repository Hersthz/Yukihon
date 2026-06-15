package com.hoang.basis.yukihon.base.crud.registry;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Holds the auto-CRUD resource descriptors discovered at startup, keyed by URL path and by entity
 * simple name (for the metadata API).
 */
@Component
@Slf4j
public class AutoCrudRegistry {

    private static final String BASE_PACKAGE = "com.hoang.basis.yukihon";

    private final Map<String, CrudDescriptor> byPath = new LinkedHashMap<>();
    private final Map<String, CrudDescriptor> byEntityName = new LinkedHashMap<>();

    @PostConstruct
    void init() {
        AutoCrudScanner scanner = new AutoCrudScanner(BASE_PACKAGE);
        for (CrudDescriptor descriptor : scanner.scan()) {
            CrudDescriptor existing = byPath.putIfAbsent(descriptor.getPath(), descriptor);
            if (existing != null) {
                throw new IllegalStateException("Duplicate @AutoCrud path '" + descriptor.getPath()
                        + "' on " + descriptor.getEntityClass().getName()
                        + " and " + existing.getEntityClass().getName());
            }
            byEntityName.put(descriptor.getEntityClass().getSimpleName(), descriptor);
            log.info("AutoCrud: registered /api/auto/{} -> {}", descriptor.getPath(),
                    descriptor.getEntityClass().getSimpleName());
        }
    }

    public Optional<CrudDescriptor> byPath(String path) {
        return Optional.ofNullable(byPath.get(path));
    }

    public Optional<CrudDescriptor> byEntityName(String entityName) {
        return Optional.ofNullable(byEntityName.get(entityName));
    }

    public Collection<CrudDescriptor> all() {
        return byPath.values();
    }
}
