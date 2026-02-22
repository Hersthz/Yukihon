package com.hoang.basis.yukihon.repository;

import com.hoang.basis.yukihon.model.TranslationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TranslationHistoryRepository extends JpaRepository<TranslationHistory, Long> {

    /** Lấy lịch sử dịch theo user, mới nhất trước */
    Page<TranslationHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Lấy bản dịch đã bookmark */
    List<TranslationHistory> findByUserIdAndBookmarkedTrueOrderByCreatedAtDesc(Long userId);

    /** Tìm bản dịch theo id + user (bảo vệ quyền sở hữu) */
    Optional<TranslationHistory> findByIdAndUserId(Long id, Long userId);

    /** Đếm tổng bản dịch của user */
    long countByUserId(Long userId);

    /** Xoá toàn bộ lịch sử dịch của user */
    @Modifying
    @Query("DELETE FROM TranslationHistory t WHERE t.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
