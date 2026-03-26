package com.hoang.basis.yukihon.system.savedword.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedWordStatsDto {
    private long totalSaved;
    private long masteredCount;
    private long dueTodayCount;
    private long kanjiDueTodayCount;
    private long vocabularyDueTodayCount;
    private List<String> folders;
}
