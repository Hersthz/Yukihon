package com.hoang.basis.yukihon.system.library.service;

import com.hoang.basis.yukihon.system.library.dto.AddCardRequest;
import com.hoang.basis.yukihon.system.library.dto.FlashcardSideContentDto;
import com.hoang.basis.yukihon.system.library.dto.FlashcardSideDto;
import com.hoang.basis.yukihon.system.library.entity.FlashcardSide;
import com.hoang.basis.yukihon.system.library.entity.FlashcardSideContent;
import com.hoang.basis.yukihon.system.library.repository.FlashcardSideContentRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardSideRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Builds and reads the rich FRONT/BACK/HINT side content of a flashcard from named fields. */
@Service
@RequiredArgsConstructor
@Transactional
public class FlashcardContentService {

    private final FlashcardSideRepository sideRepository;
    private final FlashcardSideContentRepository contentRepository;

    /** Field spec: (side, label, contentType, value). */
    private record Field(String side, String label, String type, String value) {}

    /** Rebuild all sides/contents for a flashcard from the request fields. */
    public void buildSides(Long flashcardId, AddCardRequest r) {
        deleteForFlashcard(flashcardId);

        List<Field> fields = new ArrayList<>();
        fields.add(new Field("FRONT", null, "TEXT", r.getFront()));
        fields.add(new Field("FRONT", "Cách đọc", "TEXT", r.getReading()));
        fields.add(new Field("FRONT", "Romaji", "TEXT", r.getRomaji()));
        fields.add(new Field("FRONT", null, "AUDIO", r.getAudioUrl()));
        fields.add(new Field("BACK", "Nghĩa", "TEXT", r.getBack()));
        fields.add(new Field("BACK", "Onyomi", "TEXT", r.getOnyomi()));
        fields.add(new Field("BACK", "Kunyomi", "TEXT", r.getKunyomi()));
        fields.add(new Field("BACK", "Ví dụ", "TEXT", r.getExample()));
        fields.add(new Field("BACK", "Dịch ví dụ", "TEXT", r.getExampleTranslation()));
        fields.add(new Field("BACK", "Ghi chú", "TEXT", r.getNote()));
        fields.add(new Field("BACK", null, "IMAGE", r.getImageUrl()));
        fields.add(new Field("HINT", null, "TEXT", r.getHint()));

        String[] sideOrder = {"FRONT", "BACK", "HINT"};
        for (int i = 0; i < sideOrder.length; i++) {
            String sideName = sideOrder[i];
            List<Field> sideFields = fields.stream()
                    .filter(f -> f.side().equals(sideName)
                            && f.value() != null
                            && !f.value().isBlank())
                    .toList();
            if (sideFields.isEmpty()) {
                continue;
            }
            FlashcardSide side = new FlashcardSide();
            side.setFlashcardId(flashcardId);
            side.setSide(sideName);
            side.setOrderIndex(i);
            side = sideRepository.save(side);

            List<FlashcardSideContent> contents = new ArrayList<>();
            int order = 0;
            for (Field f : sideFields) {
                FlashcardSideContent c = new FlashcardSideContent();
                c.setSideId(side.getId());
                c.setLabel(f.label());
                c.setContentType(f.type());
                c.setContentValue(f.value().trim());
                c.setOrderIndex(order++);
                contents.add(c);
            }
            contentRepository.saveAll(contents);
        }
    }

    @Transactional(readOnly = true)
    public List<FlashcardSideDto> getSides(Long flashcardId) {
        List<FlashcardSide> sides = sideRepository.findByFlashcardIdOrderByOrderIndexAsc(flashcardId);
        if (sides.isEmpty()) {
            return List.of();
        }
        Map<Long, List<FlashcardSideContent>> bySide =
                contentRepository
                        .findBySideIdInOrderByOrderIndexAsc(
                                sides.stream().map(FlashcardSide::getId).toList())
                        .stream()
                        .collect(Collectors.groupingBy(FlashcardSideContent::getSideId));
        return sides.stream()
                .map(s -> toSideDto(s, bySide.getOrDefault(s.getId(), List.of())))
                .toList();
    }

    /** Batch: flashcardId → its sides (for rendering many cards at once). */
    @Transactional(readOnly = true)
    public Map<Long, List<FlashcardSideDto>> getSidesMap(List<Long> flashcardIds) {
        if (flashcardIds.isEmpty()) {
            return Map.of();
        }
        List<FlashcardSide> sides = sideRepository.findByFlashcardIdIn(flashcardIds);
        if (sides.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<FlashcardSideContent>> bySide =
                contentRepository
                        .findBySideIdInOrderByOrderIndexAsc(
                                sides.stream().map(FlashcardSide::getId).toList())
                        .stream()
                        .collect(Collectors.groupingBy(FlashcardSideContent::getSideId));
        return sides.stream()
                .sorted(Comparator.comparing(FlashcardSide::getOrderIndex))
                .collect(Collectors.groupingBy(
                        FlashcardSide::getFlashcardId,
                        Collectors.mapping(
                                s -> toSideDto(s, bySide.getOrDefault(s.getId(), List.of())), Collectors.toList())));
    }

    /** Deep-copy all sides/contents from one flashcard to another (used when cloning a deck). */
    public void copySides(Long sourceFlashcardId, Long targetFlashcardId) {
        List<FlashcardSide> sides = sideRepository.findByFlashcardIdOrderByOrderIndexAsc(sourceFlashcardId);
        if (sides.isEmpty()) {
            return;
        }
        Map<Long, List<FlashcardSideContent>> bySide =
                contentRepository
                        .findBySideIdInOrderByOrderIndexAsc(
                                sides.stream().map(FlashcardSide::getId).toList())
                        .stream()
                        .collect(Collectors.groupingBy(FlashcardSideContent::getSideId));
        for (FlashcardSide s : sides) {
            FlashcardSide ns = new FlashcardSide();
            ns.setFlashcardId(targetFlashcardId);
            ns.setSide(s.getSide());
            ns.setOrderIndex(s.getOrderIndex());
            ns = sideRepository.save(ns);

            List<FlashcardSideContent> copies = new ArrayList<>();
            for (FlashcardSideContent c : bySide.getOrDefault(s.getId(), List.of())) {
                FlashcardSideContent nc = new FlashcardSideContent();
                nc.setSideId(ns.getId());
                nc.setLabel(c.getLabel());
                nc.setContentType(c.getContentType());
                nc.setContentValue(c.getContentValue());
                nc.setOrderIndex(c.getOrderIndex());
                nc.setMetadata(c.getMetadata());
                copies.add(nc);
            }
            contentRepository.saveAll(copies);
        }
    }

    public void deleteForFlashcard(Long flashcardId) {
        List<FlashcardSide> sides = sideRepository.findByFlashcardIdOrderByOrderIndexAsc(flashcardId);
        if (!sides.isEmpty()) {
            contentRepository.deleteBySideIdIn(
                    sides.stream().map(FlashcardSide::getId).toList());
            sideRepository.deleteByFlashcardId(flashcardId);
        }
    }

    private FlashcardSideDto toSideDto(FlashcardSide side, List<FlashcardSideContent> contents) {
        List<FlashcardSideContentDto> items = contents.stream()
                .sorted(Comparator.comparing(FlashcardSideContent::getOrderIndex))
                .map(c -> new FlashcardSideContentDto(
                        c.getId(), c.getLabel(), c.getContentType(), c.getContentValue(), c.getOrderIndex()))
                .toList();
        return new FlashcardSideDto(side.getSide(), items);
    }
}
