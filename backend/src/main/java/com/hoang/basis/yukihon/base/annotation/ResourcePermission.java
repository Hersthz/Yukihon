package com.hoang.basis.yukihon.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares the permission prefix for an auto-CRUD entity. The framework enforces
 * {@code <value>_CREATE / _READ / _UPDATE / _DELETE} authorities on the matching operations.
 * Users with {@code ROLE_ADMIN} bypass these checks. When absent, the resource only requires
 * an authenticated request (the default SecurityConfig rule for {@code /api/**}).
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ResourcePermission {
    String value();
}
