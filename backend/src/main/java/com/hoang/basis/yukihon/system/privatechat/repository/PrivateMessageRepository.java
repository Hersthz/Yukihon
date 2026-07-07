package com.hoang.basis.yukihon.system.privatechat.repository;

import com.hoang.basis.yukihon.system.privatechat.entity.PrivateMessage;
import com.hoang.basis.yukihon.system.user.entity.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {

    @Query(
            "SELECT m FROM PrivateMessage m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt DESC")
    Page<PrivateMessage> findConversation(User user1, User user2, Pageable pageable);

    /** Total messages sent to the user that they haven't read yet. */
    long countByReceiverAndReadFalse(User receiver);

    /** Unread counts grouped by sender, for the per-conversation badges. */
    @Query("SELECT m.sender.id AS senderId, COUNT(m) AS cnt FROM PrivateMessage m "
            + "WHERE m.receiver = :user AND m.read = false GROUP BY m.sender.id")
    List<UnreadPerSender> countUnreadPerSender(User user);

    /** Mark every message the reader received from `other` as read; returns rows updated. */
    @Modifying
    @Query("UPDATE PrivateMessage m SET m.read = true "
            + "WHERE m.receiver = :reader AND m.sender = :other AND m.read = false")
    int markConversationRead(User reader, User other);

    /** Projection for {@link #countUnreadPerSender}. */
    interface UnreadPerSender {
        Long getSenderId();

        long getCnt();
    }
}
