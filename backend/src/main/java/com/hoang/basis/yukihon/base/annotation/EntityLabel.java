package com.hoang.basis.yukihon.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Display labels for an auto-CRUD entity, surfaced through the metadata API. */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface EntityLabel {
    String name();

    String plural() default "";

    String description() default "";
}
