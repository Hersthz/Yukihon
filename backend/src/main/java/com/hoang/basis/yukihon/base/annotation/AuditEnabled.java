package com.hoang.basis.yukihon.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks an auto-CRUD entity whose create/update/delete operations are recorded in the audit log.
 * When {@code trackDiff} is true a JSON snapshot of the entity state is stored with each entry.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditEnabled {
    boolean trackDiff() default true;
}
