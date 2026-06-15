package com.hoang.basis.yukihon.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares a sidebar menu entry for an auto-CRUD entity. Consumed by the metadata API and (in a
 * later increment) the {@code AutoMenuInitializer} to drive a metadata-driven frontend sidebar.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ResourceMenu {
    String title();

    String group() default "General";

    String icon() default "table";

    String url() default "";

    int order() default 100;

    String permission() default "";

    String description() default "";
}
