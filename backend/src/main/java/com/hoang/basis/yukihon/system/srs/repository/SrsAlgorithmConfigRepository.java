package com.hoang.basis.yukihon.system.srs.repository;

import com.hoang.basis.yukihon.system.srs.entity.SrsAlgorithmConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SrsAlgorithmConfigRepository extends JpaRepository<SrsAlgorithmConfig, Long> {

    Optional<SrsAlgorithmConfig> findByCode(String code);
}
