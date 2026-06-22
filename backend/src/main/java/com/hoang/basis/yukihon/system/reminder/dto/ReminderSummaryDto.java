package com.hoang.basis.yukihon.system.reminder.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderSummaryDto {

    private int totalCount;
    private int urgentCount;
    private List<ReminderDto> items;
}
