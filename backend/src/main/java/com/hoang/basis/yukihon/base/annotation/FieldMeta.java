package com.hoang.basis.yukihon.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Field-level metadata consumed by the metadata API ({@code /api/meta/entities/{name}}) so the
 * frontend can render forms and tables without bespoke code.
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FieldMeta {

    /** Human-readable label. Defaults to the field name when blank. */
    String label() default "";

    /** Logical control type: text, textarea, number, boolean, date, select, image, password. */
    String type() default "text";

    boolean required() default false;

    /** Display / form ordering (ascending). */
    int order() default 100;

    String placeholder() default "";

    /** Allowed values for {@code type = "select"}. */
    String[] enumValues() default {};

    /** When true the field is shown in list/table views. */
    boolean listVisible() default true;

    /** When true the field is hidden from create/update forms (e.g. computed values). */
    boolean readOnly() default false;
}
