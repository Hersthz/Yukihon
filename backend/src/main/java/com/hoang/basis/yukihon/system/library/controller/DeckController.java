package com.hoang.basis.yukihon.system.library.controller;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.library.dto.CreateDeckRequest;
import com.hoang.basis.yukihon.system.library.dto.DeckDto;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** User-facing deck library: list/own/public decks and create a deck scoped to the current user. */
@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {

    private final DeckRepository deckRepository;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @GetMapping("/mine")
    public ResponseEntity<List<DeckDto>> myDecks(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<DeckDto> decks = deckRepository.findByUserIdAndIsDeletedFalseOrderByUpdatedAtDesc(userId).stream()
                .map(DeckDto::fromEntity)
                .toList();
        return ResponseEntity.ok(decks);
    }

    @GetMapping("/public")
    public ResponseEntity<List<DeckDto>> publicDecks() {
        List<DeckDto> decks = deckRepository.findByVisibilityAndIsDeletedFalseOrderByUpdatedAtDesc("PUBLIC").stream()
                .map(DeckDto::fromEntity)
                .toList();
        return ResponseEntity.ok(decks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckDto> getDeck(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Deck deck = deckRepository
                .findById(id)
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + id));
        if (!deck.getUserId().equals(userId) && !"PUBLIC".equals(deck.getVisibility())) {
            throw new ResourceNotFoundException("Deck not found: " + id);
        }
        return ResponseEntity.ok(DeckDto.fromEntity(deck));
    }

    @PostMapping
    public ResponseEntity<DeckDto> create(
            @Valid @RequestBody CreateDeckRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Deck deck = new Deck();
        deck.setUserId(userId);
        deck.setTitle(request.getTitle());
        deck.setDescription(request.getDescription());
        deck.setVisibility(request.getVisibility() != null ? request.getVisibility() : "PRIVATE");
        deck.setSourceLanguage(request.getSourceLanguage());
        deck.setTargetLanguage(request.getTargetLanguage());
        deck.setTotalCards(0);
        Deck saved = deckRepository.save(deck);
        return ResponseEntity.status(HttpStatus.CREATED).body(DeckDto.fromEntity(saved));
    }
}
