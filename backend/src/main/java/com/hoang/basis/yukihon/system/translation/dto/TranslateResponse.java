package com.hoang.basis.yukihon.system.translation.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslateResponse {

    private String sourceLang;
    private String targetLang;
    private String sourceText;
    private String translatedText;

    /** Kết quả phụ: phát hiện ngôn ngữ (nếu provider hỗ trợ) */
    private String detectedLang;

    /** ID bản ghi lịch sử (để bookmark sau) */
    private Long historyId;
}
