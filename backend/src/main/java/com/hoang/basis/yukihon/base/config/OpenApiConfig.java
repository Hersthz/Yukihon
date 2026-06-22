package com.hoang.basis.yukihon.base.config;

import com.hoang.basis.yukihon.base.security.CurrentUser;
import com.hoang.basis.yukihon.base.security.CurrentUserId;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger setup: API metadata + a JWT bearer security scheme (the "Authorize" button in
 * Swagger UI). Custom argument-resolver annotations are excluded so injected current-user params do
 * not leak into the generated spec. Spec at /v3/api-docs, UI at /swagger-ui.html.
 */
@Configuration
public class OpenApiConfig {

    static {
        // Params resolved by CurrentUserArgumentResolver are server-side, not request inputs.
        SpringDocUtils.getConfig().addAnnotationsToIgnore(CurrentUserId.class, CurrentUser.class);
    }

    private static final String JWT_SCHEME = "bearer-jwt";

    @Bean
    public OpenAPI yukihonOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Yukihon API")
                        .version("v1")
                        .description("Japanese–Vietnamese learning platform API."))
                .components(new Components()
                        .addSecuritySchemes(
                                JWT_SCHEME,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(JWT_SCHEME));
    }
}
