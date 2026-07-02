package com.hoang.basis.yukihon.system.dictionary.dto;

/** Set the current user's vote on a contribution: 1 (up), -1 (down), or 0 (clear). */
public record VoteRequest(Integer value) {}
