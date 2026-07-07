package com.hoang.basis.yukihon.system.friend.repository;

import com.hoang.basis.yukihon.system.friend.entity.ConnectionStatus;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionType;
import com.hoang.basis.yukihon.system.friend.entity.UserConnection;
import com.hoang.basis.yukihon.system.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserConnectionRepository extends JpaRepository<UserConnection, Long> {

    Optional<UserConnection> findByRequesterAndReceiverAndType(User requester, User receiver, ConnectionType type);

    @Query(
            "SELECT c FROM UserConnection c WHERE c.type = :type AND c.status = :status AND (c.requester = :user OR c.receiver = :user)")
    List<UserConnection> findConnectionsByUser(User user, ConnectionType type, ConnectionStatus status);

    List<UserConnection> findByReceiverAndTypeAndStatus(User receiver, ConnectionType type, ConnectionStatus status);

    List<UserConnection> findByRequesterAndTypeAndStatus(User requester, ConnectionType type, ConnectionStatus status);

    /** All connections of a type involving the user, any status — used to annotate friend search. */
    @Query("SELECT c FROM UserConnection c WHERE c.type = :type AND (c.requester = :user OR c.receiver = :user)")
    List<UserConnection> findAllByUserAndType(User user, ConnectionType type);
}
