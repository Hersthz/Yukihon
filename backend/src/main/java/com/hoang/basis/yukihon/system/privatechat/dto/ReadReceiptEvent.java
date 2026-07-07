package com.hoang.basis.yukihon.system.privatechat.dto;

/** Pushed to a sender when the recipient reads their messages ("seen"). byUserId = who read. */
public record ReadReceiptEvent(Long byUserId) {}
