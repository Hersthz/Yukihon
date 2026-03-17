package com.hoang.basis.yukihon.system.savedword.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveWordRequest {

    @NotNull(message = "Vocabulary ID is required")
    private Long vocabularyId;

    private String folderName;

    private String personalNote;
}
