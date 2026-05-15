package com.hoang.basis.yukihon.system.reminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderDto {

    private String id;
    private String type;
    private String priority;
    private String title;
    private String description;
    private String actionLabel;
    private String actionPath;
    private Integer count;
}
