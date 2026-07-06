package com.hoang.basis.yukihon.system.deckimport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hoang.basis.yukihon.system.deckimport.dto.ImportConfirmRequest;
import com.hoang.basis.yukihon.system.deckimport.dto.ImportResultResponse;
import com.hoang.basis.yukihon.system.library.dto.AddCardRequest;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import com.hoang.basis.yukihon.system.library.service.FlashcardContentService;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for {@link DeckImportService#confirm}: rich column mapping → side content, and the
 * SKIP / UPDATE / CREATE_NEW duplicate strategies. Repositories are mocked; save() hands back the
 * entity with an assigned id so downstream buildSides gets a real flashcard id.
 */
@ExtendWith(MockitoExtension.class)
class DeckImportServiceTest {

    private static final long USER_ID = 1L;

    @Mock
    private DeckRepository deckRepository;

    @Mock
    private DeckItemRepository deckItemRepository;

    @Mock
    private FlashcardRepository flashcardRepository;

    @Mock
    private FlashcardContentService flashcardContentService;

    private DeckImportService service;

    @BeforeEach
    void setUp() {
        service =
                new DeckImportService(deckRepository, deckItemRepository, flashcardRepository, flashcardContentService);
        when(deckRepository.save(any(Deck.class))).thenAnswer(inv -> {
            Deck d = inv.getArgument(0);
            if (d.getId() == null) {
                d.setId(500L);
            }
            return d;
        });
        AtomicLong seq = new AtomicLong(1000);
        when(flashcardRepository.save(any(Flashcard.class))).thenAnswer(inv -> {
            Flashcard f = inv.getArgument(0);
            if (f.getId() == null) {
                f.setId(seq.incrementAndGet());
            }
            return f;
        });
    }

    private ImportConfirmRequest req(String strategy, List<String> mapping, List<List<String>> rows) {
        ImportConfirmRequest r = new ImportConfirmRequest();
        r.setDeckTitle("Test");
        r.setDuplicateStrategy(strategy);
        r.setMapping(mapping);
        r.setRows(rows);
        return r;
    }

    @Test
    @DisplayName("Rich columns map to card fields and drive buildSides")
    void richColumnsBuildSides() {
        List<String> mapping = List.of("FRONT", "BACK", "READING", "EXAMPLE", "ONYOMI");
        List<List<String>> rows = List.of(List.of("学校", "trường học", "がっこう", "学校へ行く", "コウ"));

        ImportResultResponse res = service.confirm(USER_ID, req("SKIP", mapping, rows));

        assertThat(res.getCreated()).isEqualTo(1);
        assertThat(res.getSkipped()).isZero();

        ArgumentCaptor<AddCardRequest> captor = ArgumentCaptor.forClass(AddCardRequest.class);
        verify(flashcardContentService).buildSides(anyLong(), captor.capture());
        AddCardRequest card = captor.getValue();
        assertThat(card.getFront()).isEqualTo("学校");
        assertThat(card.getBack()).isEqualTo("trường học");
        assertThat(card.getReading()).isEqualTo("がっこう");
        assertThat(card.getExample()).isEqualTo("学校へ行く");
        assertThat(card.getOnyomi()).isEqualTo("コウ");
    }

    @Test
    @DisplayName("SKIP drops a later row with the same front")
    void skipStrategySkipsDuplicate() {
        List<String> mapping = List.of("FRONT", "BACK");
        List<List<String>> rows = List.of(List.of("犬", "chó"), List.of("犬", "con chó"));

        ImportResultResponse res = service.confirm(USER_ID, req("SKIP", mapping, rows));

        assertThat(res.getCreated()).isEqualTo(1);
        assertThat(res.getUpdated()).isZero();
        assertThat(res.getSkipped()).isEqualTo(1);
        // Only the first row's card is persisted as a deck item.
        verify(deckItemRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("UPDATE overwrites the earlier card instead of creating a new one")
    void updateStrategyUpdatesDuplicate() {
        List<String> mapping = List.of("FRONT", "BACK");
        List<List<String>> rows = List.of(List.of("犬", "chó"), List.of("犬", "con chó"));

        ImportResultResponse res = service.confirm(USER_ID, req("UPDATE", mapping, rows));

        assertThat(res.getCreated()).isEqualTo(1);
        assertThat(res.getUpdated()).isEqualTo(1);
        assertThat(res.getSkipped()).isZero();
        // buildSides runs for both the create and the update.
        verify(flashcardContentService, times(2)).buildSides(eq(1001L), any());
        // No second deck item — the duplicate updated the existing card in place.
        verify(deckItemRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("CREATE_NEW keeps every duplicate as its own card")
    void createNewStrategyKeepsDuplicates() {
        List<String> mapping = List.of("FRONT", "BACK");
        List<List<String>> rows = List.of(List.of("犬", "chó"), List.of("犬", "con chó"));

        ImportResultResponse res = service.confirm(USER_ID, req("CREATE_NEW", mapping, rows));

        assertThat(res.getCreated()).isEqualTo(2);
        assertThat(res.getUpdated()).isZero();
        verify(deckItemRepository, times(2)).save(any());
        verify(flashcardContentService, times(2)).buildSides(anyLong(), any());
    }

    @Test
    @DisplayName("Blank front rows are skipped, never build a card")
    void blankFrontSkipped() {
        List<String> mapping = List.of("FRONT", "BACK");
        List<List<String>> rows = List.of(List.of("", "chó"), List.of("猫", "mèo"));

        ImportResultResponse res = service.confirm(USER_ID, req("SKIP", mapping, rows));

        assertThat(res.getCreated()).isEqualTo(1);
        assertThat(res.getSkipped()).isEqualTo(1);
        verify(flashcardContentService, never()).buildSides(anyLong(), argThatFrontIsBlank());
    }

    private static AddCardRequest argThatFrontIsBlank() {
        return org.mockito.ArgumentMatchers.argThat(
                r -> r != null && (r.getFront() == null || r.getFront().isBlank()));
    }
}
