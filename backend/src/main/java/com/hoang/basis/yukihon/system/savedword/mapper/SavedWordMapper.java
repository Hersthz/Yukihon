package com.hoang.basis.yukihon.system.savedword.mapper;

import com.hoang.basis.yukihon.system.savedword.dto.SavedWordDto;
import com.hoang.basis.yukihon.system.savedword.entity.SavedWord;
import org.springframework.stereotype.Component;

@Component
public class SavedWordMapper {

    public SavedWordDto toDto(SavedWord entity) {
        return SavedWordDto.fromEntity(entity);
    }
}
