package com.hoang.basis.yukihon.system.srs.repository;

import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsSetting;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnkiSrsSettingRepository extends JpaRepository<AnkiSrsSetting, Long> {

    Optional<AnkiSrsSetting> findByUserIdAndDeckId(Long userId, Long deckId);
}
