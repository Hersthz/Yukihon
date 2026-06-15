package com.hoang.basis.yukihon.base.metadata;

import com.hoang.basis.yukihon.base.annotation.FieldMeta;
import com.hoang.basis.yukihon.base.crud.registry.AutoCrudRegistry;
import com.hoang.basis.yukihon.base.crud.registry.CrudDescriptor;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Introspection API powering the metadata-driven frontend. Lists auto-CRUD resources and exposes
 * each entity's field schema so admin tables/forms can be generated without bespoke code.
 */
@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
public class MetadataController {

    private final AutoCrudRegistry registry;

    @GetMapping("/entities")
    public List<EntityMetadata> entities() {
        return registry.all().stream().map(this::toMetadata).toList();
    }

    @GetMapping("/entities/{name}")
    public EntityMetadata entity(@PathVariable String name) {
        CrudDescriptor descriptor = registry.byEntityName(name)
                .or(() -> registry.byPath(name))
                .orElseThrow(() -> new ResourceNotFoundException("Unknown entity: " + name));
        return toMetadata(descriptor);
    }

    private EntityMetadata toMetadata(CrudDescriptor descriptor) {
        EntityMetadata.MenuMetadata menu = descriptor.hasMenu()
                ? new EntityMetadata.MenuMetadata(
                        descriptor.getMenuTitle(),
                        descriptor.getMenuGroup(),
                        descriptor.getMenuIcon(),
                        descriptor.getMenuUrl(),
                        descriptor.getMenuOrder(),
                        descriptor.getMenuPermission())
                : null;

        return new EntityMetadata(
                descriptor.getLabel(),
                descriptor.getPlural(),
                descriptor.getPath(),
                descriptor.getDescription(),
                descriptor.getPermissionPrefix(),
                descriptor.isSoftDelete(),
                descriptor.isEnableBulkDelete(),
                descriptor.getSearchableFields(),
                descriptor.getSortableFields(),
                menu,
                describeFields(descriptor.getEntityClass())
        );
    }

    private List<FieldMetadata> describeFields(Class<?> entityClass) {
        List<FieldMetadata> fields = new ArrayList<>();
        for (Field field : entityClass.getDeclaredFields()) {
            if (Modifier.isStatic(field.getModifiers()) || field.isSynthetic()) {
                continue;
            }
            FieldMeta meta = field.getAnnotation(FieldMeta.class);
            String label = meta != null && !meta.label().isBlank() ? meta.label() : humanize(field.getName());
            String type = meta != null && !meta.type().isBlank() ? meta.type() : inferType(field.getType());
            List<String> enumValues = resolveEnumValues(field, meta);

            fields.add(new FieldMetadata(
                    field.getName(),
                    label,
                    type,
                    meta != null && meta.required(),
                    meta != null ? meta.order() : 100,
                    meta != null ? meta.placeholder() : "",
                    enumValues,
                    meta == null || meta.listVisible(),
                    meta != null && meta.readOnly()
            ));
        }
        fields.sort(Comparator.comparingInt(FieldMetadata::order));
        return fields;
    }

    private List<String> resolveEnumValues(Field field, FieldMeta meta) {
        if (meta != null && meta.enumValues().length > 0) {
            return List.of(meta.enumValues());
        }
        if (field.getType().isEnum()) {
            List<String> values = new ArrayList<>();
            for (Object constant : field.getType().getEnumConstants()) {
                values.add(((Enum<?>) constant).name());
            }
            return values;
        }
        return List.of();
    }

    private String inferType(Class<?> type) {
        if (type == boolean.class || type == Boolean.class) {
            return "boolean";
        }
        if (Number.class.isAssignableFrom(type)
                || type == int.class || type == long.class || type == double.class || type == float.class) {
            return "number";
        }
        if (type == Instant.class || type == LocalDate.class || type == LocalDateTime.class) {
            return "date";
        }
        if (type.isEnum()) {
            return "select";
        }
        return "text";
    }

    private String humanize(String name) {
        String spaced = name.replaceAll("([a-z])([A-Z])", "$1 $2");
        return Character.toUpperCase(spaced.charAt(0)) + spaced.substring(1);
    }
}
