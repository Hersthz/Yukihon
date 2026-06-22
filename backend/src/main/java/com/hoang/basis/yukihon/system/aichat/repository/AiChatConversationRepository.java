package com.hoang.basis.yukihon.system.aichat.repository;

import com.hoang.basis.yukihon.system.aichat.entity.AiChatConversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiChatConversationRepository extends JpaRepository<AiChatConversation, Long> {

    List<AiChatConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<AiChatConversation> findByIdAndUserId(Long id, Long userId);

    long deleteByUserId(Long userId);
}
