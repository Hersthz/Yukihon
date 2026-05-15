package com.hoang.basis.yukihon.system.reminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderSummaryDto {

    private int totalCount;
    private int urgentCount;
    private List<ReminderDto> items;
}
