package com.hoang.basis.yukihon.base.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Injects the authenticated {@code User} entity into a controller method parameter.
 * Resolved by {@link CurrentUserArgumentResolver}; throws 401 if there is no authenticated user.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {}
