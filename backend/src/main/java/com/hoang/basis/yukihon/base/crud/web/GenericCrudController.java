package com.hoang.basis.yukihon.base.crud.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.hoang.basis.yukihon.base.crud.registry.AutoCrudRegistry;
import com.hoang.basis.yukihon.base.crud.registry.CrudDescriptor;
import com.hoang.basis.yukihon.base.crud.security.CrudPermissionChecker;
import com.hoang.basis.yukihon.base.crud.security.CrudPermissionChecker.Action;
import com.hoang.basis.yukihon.base.crud.service.GenericCrudService;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Single dispatch controller serving every {@code @AutoCrud} entity under {@code /api/auto/{resource}}.
 * Mounted on a dedicated prefix so it never shadows the hand-written domain controllers.
 */
@RestController
@RequestMapping("/api/auto")
@RequiredArgsConstructor
public class GenericCrudController {

    private final AutoCrudRegistry registry;
    private final GenericCrudService service;
    private final CrudPermissionChecker permissionChecker;
    private final DefaultCrudMapper mapper;

    private CrudDescriptor resolve(String resource) {
        return registry.byPath(resource)
                .orElseThrow(() -> new ResourceNotFoundException("Unknown resource: " + resource));
    }

    private static final Set<String> RESERVED_PARAMS = Set.of("page", "size", "sort", "search");

    @GetMapping("/{resource}")
    public Page<Object> list(
            @PathVariable String resource,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Map<String, String> allParams,
            Pageable pageable) {
        CrudDescriptor descriptor = resolve(resource);
        permissionChecker.check(descriptor, Action.READ);

        Map<String, String> filters = new HashMap<>();
        if (allParams != null) {
            allParams.forEach((key, value) -> {
                if (!RESERVED_PARAMS.contains(key)
                        && descriptor.getFilterableFields().contains(key)) {
                    filters.put(key, value);
                }
            });
        }

        return service.list(descriptor, search, filters, pageable).map(entity -> mapper.toResponse(descriptor, entity));
    }

    @GetMapping("/{resource}/{id}")
    public ResponseEntity<Object> get(@PathVariable String resource, @PathVariable Long id) {
        CrudDescriptor descriptor = resolve(resource);
        permissionChecker.check(descriptor, Action.READ);
        return ResponseEntity.ok(mapper.toResponse(descriptor, service.get(descriptor, id)));
    }

    @PostMapping("/{resource}")
    public ResponseEntity<Object> create(@PathVariable String resource, @RequestBody JsonNode payload) {
        CrudDescriptor descriptor = resolve(resource);
        permissionChecker.check(descriptor, Action.CREATE);
        Object created = service.create(descriptor, payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(descriptor, created));
    }

    @PutMapping("/{resource}/{id}")
    public ResponseEntity<Object> update(
            @PathVariable String resource, @PathVariable Long id, @RequestBody JsonNode payload) {
        CrudDescriptor descriptor = resolve(resource);
        permissionChecker.check(descriptor, Action.UPDATE);
        Object updated = service.update(descriptor, id, payload);
        return ResponseEntity.ok(mapper.toResponse(descriptor, updated));
    }

    @DeleteMapping("/{resource}/{id}")
    public ResponseEntity<Void> delete(@PathVariable String resource, @PathVariable Long id) {
        CrudDescriptor descriptor = resolve(resource);
        permissionChecker.check(descriptor, Action.DELETE);
        service.delete(descriptor, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{resource}/bulk-delete")
    public ResponseEntity<Void> bulkDelete(@PathVariable String resource, @RequestBody List<Long> ids) {
        CrudDescriptor descriptor = resolve(resource);
        if (!descriptor.isEnableBulkDelete()) {
            throw new ResourceNotFoundException("Bulk delete not enabled for: " + resource);
        }
        permissionChecker.check(descriptor, Action.DELETE);
        service.bulkDelete(descriptor, ids);
        return ResponseEntity.noContent().build();
    }
}
