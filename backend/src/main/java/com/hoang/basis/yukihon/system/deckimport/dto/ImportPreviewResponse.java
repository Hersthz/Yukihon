package com.hoang.basis.yukihon.system.deckimport.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Parsed preview of an uploaded deck file: columns, sample rows and a suggested column→field mapping. */
@Data
@Builder
public class ImportPreviewResponse {

    private String delimiter; // "," "\t" ";" "|"
    private boolean headerDetected;
    private int totalRows; // data rows (header excluded if detected)
    private List<Column> columns;
    private List<List<String>> rows; // data rows (header excluded), capped
    private List<String> suggestedMapping; // per column: FRONT/BACK/HINT/READING/ONYOMI/…/IGNORE

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Column {
        private String header;
        private String sample;
    }
}
