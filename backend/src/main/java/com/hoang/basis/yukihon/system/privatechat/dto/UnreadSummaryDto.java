package com.hoang.basis.yukihon.system.privatechat.dto;

import java.util.List;

/** Unread private-message summary: total plus a per-sender breakdown for conversation badges. */
public record UnreadSummaryDto(long total, List<UnreadCount> perUser) {
    public record UnreadCount(Long userId, long count) {}
}
