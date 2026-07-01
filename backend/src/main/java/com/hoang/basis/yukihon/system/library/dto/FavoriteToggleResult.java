package com.hoang.basis.yukihon.system.library.dto;

/** Result of toggling a deck favorite: the new state and the updated favorite count. */
public record FavoriteToggleResult(boolean favorited, Integer favoriteCount) {}
