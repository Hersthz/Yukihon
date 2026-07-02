package com.hoang.basis.yukihon.system.dictionary.service;

import com.hoang.basis.yukihon.system.dictionary.repository.KanjiRadicalRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Radical picker reads: list all radicals, and find kanji containing a set of radicals. */
@Service
@RequiredArgsConstructor
public class RadicalService {

    private final KanjiRadicalRepository repository;

    @Transactional(readOnly = true)
    public List<String> listRadicals() {
        return repository.findDistinctRadicals();
    }

    @Transactional(readOnly = true)
    public List<String> kanjiByRadicals(List<String> radicals) {
        List<String> cleaned = radicals == null
                ? List.of()
                : radicals.stream()
                        .filter(r -> r != null && !r.isBlank())
                        .distinct()
                        .toList();
        if (cleaned.isEmpty()) {
            return List.of();
        }
        return repository.findKanjiByRadicals(cleaned, cleaned.size());
    }
}
