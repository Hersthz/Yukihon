package com.hoang.basis.yukihon.system.aichat.repository;

import com.hoang.basis.yukihon.system.aichat.entity.AiChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {

    List<AiChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

    List<AiChatMessage> findByConversationIdAndUserIdOrderByCreatedAtAsc(Long conversationId, Long userId);

    long countByConversationId(Long conversationId);

    long deleteByUserId(Long userId);
}
