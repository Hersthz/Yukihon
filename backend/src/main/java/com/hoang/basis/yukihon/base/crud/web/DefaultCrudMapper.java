package com.hoang.basis.yukihon.base.crud.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.base.crud.registry.CrudDescriptor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Maps an entity to its response shape: the declared DTO, or the entity itself when none. */
@Component
@RequiredArgsConstructor
public class DefaultCrudMapper {

    private final ObjectMapper objectMapper;

    public Object toResponse(CrudDescriptor descriptor, Object entity) {
        if (entity == null || !descriptor.hasDto()) {
            return entity;
        }
        return objectMapper.convertValue(entity, descriptor.getDtoClass());
    }
}
