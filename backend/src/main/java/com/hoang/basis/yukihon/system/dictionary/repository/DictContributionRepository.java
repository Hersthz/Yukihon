package com.hoang.basis.yukihon.system.dictionary.repository;

import com.hoang.basis.yukihon.system.dictionary.entity.DictContribution;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DictContributionRepository extends JpaRepository<DictContribution, Long> {

    List<DictContribution> findByHeadword(String headword);
}
