package com.hoang.basis.yukihon.base.crud.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Base interface for typed repositories that want the auto-CRUD specification support. Optional:
 * the generic CRUD layer uses an internally-built {@code SimpleJpaRepository} and does not require
 * a declared repository per entity.
 */
@NoRepositoryBean
public interface BaseCrudRepository<E, ID> extends JpaRepository<E, ID>, JpaSpecificationExecutor<E> {
}
