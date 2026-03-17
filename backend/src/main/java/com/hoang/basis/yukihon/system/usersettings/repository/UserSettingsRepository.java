package com.hoang.basis.yukihon.system.usersettings.repository;

import com.hoang.basis.yukihon.system.usersettings.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    Optional<UserSettings> findByUserId(Long userId);
}
