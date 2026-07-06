package com.hoang.basis.yukihon.system.library.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.library.dto.FlashcardSideContentDto;
import com.hoang.basis.yukihon.system.library.dto.FlashcardSideDto;
import com.hoang.basis.yukihon.system.library.dto.FlashcardTemplateDto;
import com.hoang.basis.yukihon.system.library.dto.RenderedCardDto;
import com.hoang.basis.yukihon.system.library.dto.TemplateUpsertRequest;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.entity.FlashcardTemplate;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardTemplateRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Manages card render templates and renders a card's HTML by filling {@code {{field}}} slots. */
@Service
@RequiredArgsConstructor
@Transactional
public class FlashcardTemplateService {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*(\\w+)\\s*\\}\\}");

    private final FlashcardTemplateRepository templateRepository;
    private final FlashcardRepository flashcardRepository;
    private final DeckRepository deckRepository;
    private final FlashcardContentService contentService;

    // ===================== CRUD =====================

    @Transactional(readOnly = true)
    public List<FlashcardTemplateDto> list(Long userId) {
        return templateRepository.findByIsSystemTrueOrUserId(userId).stream()
                .map(t -> toDto(t, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public FlashcardTemplateDto get(Long userId, Long id) {
        return toDto(load(id), userId);
    }

    @Transactional(readOnly = true)
    public FlashcardTemplateDto getDefault(Long userId, String cardType) {
        return templateRepository
                .findFirstByIsSystemTrueAndIsDefaultTrueAndCardType(cardType == null ? "BASIC" : cardType)
                .map(t -> toDto(t, userId))
                .orElseThrow(() -> new ResourceNotFoundException("No default template"));
    }

    public FlashcardTemplateDto create(Long userId, TemplateUpsertRequest r) {
        FlashcardTemplate t = new FlashcardTemplate();
        t.setUserId(userId);
        t.setCardType(r.cardType() != null ? r.cardType() : "BASIC");
        apply(t, r);
        t.setIsSystem(false);
        t.setIsDefault(false);
        t.setVisibility("PRIVATE");
        return toDto(templateRepository.save(t), userId);
    }

    public FlashcardTemplateDto update(Long userId, Long id, TemplateUpsertRequest r) {
        FlashcardTemplate t = requireOwn(userId, id);
        apply(t, r);
        return toDto(templateRepository.save(t), userId);
    }

    public void delete(Long userId, Long id) {
        templateRepository.delete(requireOwn(userId, id));
    }

    // ===================== RENDER =====================

    /** Render one card's front/back HTML using the deck's template (or the system default). */
    @Transactional(readOnly = true)
    public RenderedCardDto renderCard(Long flashcardId, Long deckId) {
        Flashcard fc = flashcardRepository
                .findById(flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + flashcardId));
        Map<String, String> fields = fieldsOf(fc, contentService.getSides(flashcardId));

        FlashcardTemplate template = resolveTemplate(deckId, fc.getCardType());
        if (template == null) {
            return new RenderedCardDto(
                    esc(fields.getOrDefault("front", "")), esc(fields.getOrDefault("meaning", "")), "");
        }
        return new RenderedCardDto(
                fill(template.getFrontTemplate(), fields),
                fill(template.getBackTemplate(), fields),
                template.getStyling());
    }

    private FlashcardTemplate resolveTemplate(Long deckId, String cardType) {
        if (deckId != null) {
            Long templateId =
                    deckRepository.findById(deckId).map(Deck::getTemplateId).orElse(null);
            if (templateId != null) {
                FlashcardTemplate t = templateRepository.findById(templateId).orElse(null);
                if (t != null) {
                    return t;
                }
            }
        }
        return templateRepository
                .findFirstByIsSystemTrueAndIsDefaultTrueAndCardType(cardType == null ? "BASIC" : cardType)
                .orElse(null);
    }

    /** Build the {field → value} map from the card's flat fields + rich side contents. */
    private Map<String, String> fieldsOf(Flashcard fc, List<FlashcardSideDto> sides) {
        Map<String, String> m = new HashMap<>();
        putIfText(m, "front", fc.getFront());
        putIfText(m, "meaning", fc.getBack());
        putIfText(m, "hint", fc.getHint());
        putIfText(m, "image", fc.getImageUrl());
        putIfText(m, "audio", fc.getAudioUrl());
        for (FlashcardSideDto side : sides) {
            for (FlashcardSideContentDto c : side.contents()) {
                String key = keyFor(side.side(), c.label(), c.contentType());
                if (key != null && c.contentValue() != null) {
                    m.put(key, c.contentValue());
                }
            }
        }
        return m;
    }

    private String keyFor(String side, String label, String type) {
        if (label != null) {
            return switch (label) {
                case "Cách đọc" -> "reading";
                case "Romaji" -> "romaji";
                case "Nghĩa" -> "meaning";
                case "Onyomi" -> "onyomi";
                case "Kunyomi" -> "kunyomi";
                case "Ví dụ" -> "example";
                case "Dịch ví dụ" -> "exampleTranslation";
                case "Ghi chú" -> "note";
                default -> null;
            };
        }
        if ("AUDIO".equals(type)) return "audio";
        if ("IMAGE".equals(type)) return "image";
        return switch (side) {
            case "FRONT" -> "front";
            case "HINT" -> "hint";
            default -> "meaning";
        };
    }

    private String fill(String template, Map<String, String> fields) {
        if (template == null) {
            return "";
        }
        Matcher m = PLACEHOLDER.matcher(template);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            m.appendReplacement(sb, Matcher.quoteReplacement(esc(fields.getOrDefault(m.group(1), ""))));
        }
        m.appendTail(sb);
        return sb.toString();
    }

    private void putIfText(Map<String, String> m, String key, String value) {
        if (value != null && !value.isBlank()) {
            m.put(key, value);
        }
    }

    /** Escape injected field values so card content can't break the template HTML. */
    private String esc(String s) {
        return s == null
                ? ""
                : s.replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;")
                        .replace("\"", "&quot;");
    }

    private void apply(FlashcardTemplate t, TemplateUpsertRequest r) {
        t.setName(r.name());
        if (r.cardType() != null) {
            t.setCardType(r.cardType());
        }
        t.setDescription(r.description());
        t.setFrontTemplate(r.frontTemplate());
        t.setBackTemplate(r.backTemplate());
        t.setStyling(r.styling());
    }

    private FlashcardTemplate load(Long id) {
        return templateRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + id));
    }

    private FlashcardTemplate requireOwn(Long userId, Long id) {
        FlashcardTemplate t = load(id);
        if (Boolean.TRUE.equals(t.getIsSystem()) || !userId.equals(t.getUserId())) {
            throw new AccessDeniedException("Not your template");
        }
        return t;
    }

    private FlashcardTemplateDto toDto(FlashcardTemplate t, Long userId) {
        return new FlashcardTemplateDto(
                t.getId(),
                t.getCardType(),
                t.getName(),
                t.getDescription(),
                t.getFrontTemplate(),
                t.getBackTemplate(),
                t.getStyling(),
                Boolean.TRUE.equals(t.getIsSystem()),
                Boolean.TRUE.equals(t.getIsDefault()),
                userId.equals(t.getUserId()));
    }
}
