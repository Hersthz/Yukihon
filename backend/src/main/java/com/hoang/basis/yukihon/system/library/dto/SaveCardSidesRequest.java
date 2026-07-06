package com.hoang.basis.yukihon.system.library.dto;

import java.util.List;

/** Replace a card's sides/contents with an explicit ordered list of blocks (from the block editor). */
public record SaveCardSidesRequest(List<CardBlockInput> blocks) {

    /** One content block: which side, its label, type (TEXT/IMAGE/AUDIO/VIDEO/CLOZE) and value. */
    public record CardBlockInput(String side, String label, String contentType, String contentValue) {}
}
