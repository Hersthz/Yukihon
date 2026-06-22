package com.hoang.basis.yukihon.system.usersettings.repository;

import com.hoang.basis.yukihon.system.usersettings.entity.UserSettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    Optional<UserSettings> findByUserId(Long userId);
}
