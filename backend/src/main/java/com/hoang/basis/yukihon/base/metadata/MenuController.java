package com.hoang.basis.yukihon.base.metadata;

import com.hoang.basis.yukihon.base.crud.registry.AutoCrudRegistry;
import com.hoang.basis.yukihon.base.crud.registry.CrudDescriptor;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the auto-CRUD navigation derived live from {@code @ResourceMenu}, filtered to the entries
 * the current user is allowed to see. Lets the frontend render module menus without hardcoding them.
 */
@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
public class MenuController {

    private final AutoCrudRegistry registry;

    public record MenuItem(String title, String url, String icon, int order, String permission) {}

    public record MenuGroup(String group, List<MenuItem> items) {}

    @GetMapping("/menu")
    public List<MenuGroup> menu() {
        Set<String> authorities = currentAuthorities();
        boolean admin = authorities.contains("ROLE_ADMIN");

        Map<String, List<MenuItem>> grouped = new LinkedHashMap<>();
        for (CrudDescriptor descriptor : registry.all()) {
            if (!descriptor.hasMenu()) {
                continue;
            }
            String required = descriptor.getMenuPermission();
            boolean allowed = admin || required == null || required.isBlank() || authorities.contains(required);
            if (!allowed) {
                continue;
            }
            grouped.computeIfAbsent(descriptor.getMenuGroup(), g -> new java.util.ArrayList<>())
                    .add(new MenuItem(
                            descriptor.getMenuTitle(),
                            descriptor.getMenuUrl(),
                            descriptor.getMenuIcon(),
                            descriptor.getMenuOrder(),
                            required));
        }

        return grouped.entrySet().stream()
                .map(entry -> {
                    List<MenuItem> items = entry.getValue().stream()
                            .sorted(Comparator.comparingInt(MenuItem::order))
                            .toList();
                    return new MenuGroup(entry.getKey(), items);
                })
                .sorted(Comparator.comparing(MenuGroup::group))
                .toList();
    }

    private Set<String> currentAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Set.of();
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }
}
