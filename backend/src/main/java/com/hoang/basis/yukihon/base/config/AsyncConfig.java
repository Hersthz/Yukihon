package com.hoang.basis.yukihon.base.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Enables {@code @Async} support used by cross-cutting concerns (audit logging, notifications). */
@Configuration
@EnableAsync
public class AsyncConfig {
}
