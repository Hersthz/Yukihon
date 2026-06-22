package com.hoang.basis.yukihon.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * When present on an auto-CRUD entity (which must extend {@code BaseEntity}), DELETE sets
 * {@code isDeleted = true} instead of removing the row, and list/get queries exclude
 * soft-deleted rows.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface SoftDelete {}
