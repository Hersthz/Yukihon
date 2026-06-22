package com.hoang.basis.yukihon.base.crud.registry;

import com.hoang.basis.yukihon.base.annotation.AutoCrud;
import com.hoang.basis.yukihon.base.annotation.EntityLabel;
import com.hoang.basis.yukihon.base.annotation.Filterable;
import com.hoang.basis.yukihon.base.annotation.ResourceMenu;
import com.hoang.basis.yukihon.base.annotation.ResourcePermission;
import com.hoang.basis.yukihon.base.annotation.Searchable;
import com.hoang.basis.yukihon.base.annotation.SoftDelete;
import com.hoang.basis.yukihon.base.annotation.Sortable;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;

/** Scans the application base package for {@link AutoCrud} entities and builds descriptors. */
@Slf4j
public class AutoCrudScanner {

    private final String basePackage;

    public AutoCrudScanner(String basePackage) {
        this.basePackage = basePackage;
    }

    public List<CrudDescriptor> scan() {
        ClassPathScanningCandidateComponentProvider provider = new ClassPathScanningCandidateComponentProvider(false);
        provider.addIncludeFilter(new AnnotationTypeFilter(AutoCrud.class));

        List<CrudDescriptor> descriptors = new ArrayList<>();
        for (var candidate : provider.findCandidateComponents(basePackage)) {
            String className = candidate.getBeanClassName();
            try {
                Class<?> entityClass = Class.forName(className);
                CrudDescriptor descriptor = toDescriptor(entityClass);
                if (descriptor.isAutoRegister()) {
                    descriptors.add(descriptor);
                }
            } catch (ClassNotFoundException e) {
                log.warn("AutoCrud: could not load candidate class {}", className, e);
            }
        }
        log.info("AutoCrud: discovered {} auto-CRUD resource(s)", descriptors.size());
        return descriptors;
    }

    private CrudDescriptor toDescriptor(Class<?> entityClass) {
        AutoCrud autoCrud = entityClass.getAnnotation(AutoCrud.class);

        Class<?> dto = autoCrud.dto();
        Class<?> dtoClass = (dto == null || dto == void.class) ? null : dto;

        ResourcePermission permission = entityClass.getAnnotation(ResourcePermission.class);
        String permissionPrefix = permission != null ? permission.value() : null;

        Searchable searchable = entityClass.getAnnotation(Searchable.class);
        Sortable sortable = entityClass.getAnnotation(Sortable.class);
        Filterable filterable = entityClass.getAnnotation(Filterable.class);

        EntityLabel label = entityClass.getAnnotation(EntityLabel.class);
        String name = label != null ? label.name() : entityClass.getSimpleName();
        String plural = label != null && !label.plural().isBlank() ? label.plural() : name + "s";
        String description = label != null ? label.description() : "";

        ResourceMenu menu = entityClass.getAnnotation(ResourceMenu.class);

        return CrudDescriptor.builder()
                .entityClass(entityClass)
                .path(autoCrud.path())
                .dtoClass(dtoClass)
                .permissionPrefix(permissionPrefix)
                .searchableFields(searchable != null ? List.of(searchable.fields()) : List.of())
                .sortableFields(sortable != null ? List.of(sortable.fields()) : List.of())
                .filterableFields(filterable != null ? List.of(filterable.fields()) : List.of())
                .softDelete(entityClass.isAnnotationPresent(SoftDelete.class))
                .enableBulkDelete(autoCrud.enableBulkDelete())
                .autoRegister(autoCrud.autoRegister())
                .label(name)
                .plural(plural)
                .description(description)
                .menuTitle(menu != null ? menu.title() : null)
                .menuGroup(menu != null ? menu.group() : null)
                .menuIcon(menu != null ? menu.icon() : null)
                .menuUrl(menu != null ? menu.url() : null)
                .menuOrder(menu != null ? menu.order() : 100)
                .menuPermission(menu != null ? menu.permission() : null)
                .build();
    }
}
