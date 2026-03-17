package com.hoang.basis.yukihon.system.translation.mapper;

import com.hoang.basis.yukihon.system.translation.dto.TranslationHistoryDto;
import com.hoang.basis.yukihon.system.translation.entity.TranslationHistory;
import org.springframework.stereotype.Component;

@Component
public class TranslationMapper {

    public TranslationHistoryDto toHistoryDto(TranslationHistory entity) {
        return TranslationHistoryDto.fromEntity(entity);
    }
}
