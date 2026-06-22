package com.hoang.basis.yukihon.system.srs.repository;

import com.hoang.basis.yukihon.system.srs.entity.SrsAlgorithmConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SrsAlgorithmConfigRepository extends JpaRepository<SrsAlgorithmConfig, Long> {

    Optional<SrsAlgorithmConfig> findByCode(String code);
}
