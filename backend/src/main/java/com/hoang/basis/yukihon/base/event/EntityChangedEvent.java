package com.hoang.basis.yukihon.base.event;

/**
 * Published by the generic CRUD layer after every create/update/delete. The backbone for
 * cross-cutting reactions (audit logging now; gamification, notifications, cache eviction later)
 * without coupling business modules to one another.
 *
 * @param entityClass the JPA entity type that changed
 * @param entityType  simple name of the entity (e.g. "AppSetting")
 * @param entityId    primary key of the affected row
 * @param type        the lifecycle action
 * @param snapshotJson JSON snapshot of the entity state (may be null if serialization failed or disabled)
 * @param actor       username/email of the principal that triggered the change ("system" if none)
 */
public record EntityChangedEvent(
        Class<?> entityClass,
        String entityType,
        Long entityId,
        EntityChangeType type,
        String snapshotJson,
        String actor) {}
