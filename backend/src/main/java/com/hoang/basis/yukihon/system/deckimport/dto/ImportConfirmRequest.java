package com.hoang.basis.yukihon.system.deckimport.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

/** Confirm an import: create a new deck and its cards from the mapped rows. */
@Data
public class ImportConfirmRequest {

    private String deckTitle;
    private String deckDescription;
    private String visibility; // PRIVATE | PUBLIC

    /** How to treat rows whose FRONT already appeared: SKIP (default) | UPDATE | CREATE_NEW. */
    private String duplicateStrategy;

    /**
     * Target field per column index: FRONT | BACK | HINT | READING | ROMAJI | ONYOMI | KUNYOMI |
     * EXAMPLE | EXAMPLE_TRANSLATION | NOTE | IMAGE | AUDIO | IGNORE.
     */
    @NotEmpty
    private List<String> mapping;

    /** Data rows (header already excluded by the client). */
    @NotEmpty
    private List<List<String>> rows;
}
