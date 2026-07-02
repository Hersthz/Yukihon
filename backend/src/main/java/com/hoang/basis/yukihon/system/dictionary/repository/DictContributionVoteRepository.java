package com.hoang.basis.yukihon.system.dictionary.repository;

import com.hoang.basis.yukihon.system.dictionary.entity.DictContributionVote;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DictContributionVoteRepository extends JpaRepository<DictContributionVote, Long> {

    Optional<DictContributionVote> findByContributionIdAndUserId(Long contributionId, Long userId);

    List<DictContributionVote> findByUserIdAndContributionIdIn(Long userId, List<Long> contributionIds);

    int countByContributionIdAndValue(Long contributionId, Integer value);

    void deleteByContributionId(Long contributionId);
}
