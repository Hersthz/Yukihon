package com.hoang.basis.yukihon.system.userlearningstats.repository;

import com.hoang.basis.yukihon.system.userlearningstats.entity.UserLearningStats;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLearningStatsRepository extends JpaRepository<UserLearningStats, Long> {

    Optional<UserLearningStats> findByUserId(Long userId);

    Optional<UserLearningStats> findByUserEmail(String userEmail);
}
