package com.hoang.basis.yukihon.system.privatechat.repository;

import com.hoang.basis.yukihon.system.privatechat.entity.PrivateMessage;
import com.hoang.basis.yukihon.system.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {

    @Query("SELECT m FROM PrivateMessage m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt DESC")
    Page<PrivateMessage> findConversation(User user1, User user2, Pageable pageable);

}
