package com.hoang.basis.yukihon.system.srs.repository;

import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnkiSrsSettingRepository extends JpaRepository<AnkiSrsSetting, Long> {

    Optional<AnkiSrsSetting> findByUserIdAndDeckId(Long userId, Long deckId);
}
