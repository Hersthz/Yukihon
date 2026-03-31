package com.hoang.basis.yukihon.system.community.repository;

import com.hoang.basis.yukihon.system.community.entity.CommunityChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityChatMessageRepository extends JpaRepository<CommunityChatMessage, Long> {

    Page<CommunityChatMessage> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);
}
