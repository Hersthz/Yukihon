package com.hoang.basis.yukihon.system.deckimport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Outcome of a confirmed import. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportResultResponse {
    private Long deckId;
    private int created;
    private int updated;
    private int skipped;
}
