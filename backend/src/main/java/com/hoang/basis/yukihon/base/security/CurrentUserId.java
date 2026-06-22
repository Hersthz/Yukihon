package com.hoang.basis.yukihon.base.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Injects the authenticated user's id ({@code Long}) into a controller method parameter,
 * replacing the duplicated {@code getUserId(UserDetails)} helper. Resolved by
 * {@link CurrentUserArgumentResolver}; throws 401 if there is no authenticated user.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUserId {}
