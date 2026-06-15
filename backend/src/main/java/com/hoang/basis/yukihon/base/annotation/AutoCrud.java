package com.hoang.basis.yukihon.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a JPA entity as auto-CRUD enabled. At startup the {@code AutoCrudScanner}
 * discovers every entity carrying this annotation and registers a generic REST
 * resource for it under {@code /api/auto/{path}} (see {@code GenericCrudController}).
 *
 * <p>No controller / service / repository is required for plain CRUD. Because Yukihon
 * uses Flyway with {@code ddl-auto: none}, the backing table must still be created via a
 * migration — declaring the entity does NOT create the table.</p>
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface AutoCrud {

    /** URL segment for the resource, e.g. {@code "app-settings"} -> {@code /api/auto/app-settings}. */
    String path();

    /**
     * Optional DTO used for responses. When {@code void.class} (default) the entity is
     * serialized directly. A DTO with a public no-arg constructor is populated by copying
     * matching properties from the entity.
     */
    Class<?> dto() default void.class;

    /** Whether bulk delete ({@code POST /api/auto/{path}/bulk-delete}) is exposed. */
    boolean enableBulkDelete() default true;

    /** When true, DELETE performs a soft delete if the entity extends {@code BaseEntity}. */
    boolean autoRegister() default true;
}
