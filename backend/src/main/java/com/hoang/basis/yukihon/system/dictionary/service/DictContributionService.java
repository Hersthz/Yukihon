package com.hoang.basis.yukihon.system.dictionary.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.dictionary.dto.CreateContributionRequest;
import com.hoang.basis.yukihon.system.dictionary.dto.DictContributionDto;
import com.hoang.basis.yukihon.system.dictionary.entity.DictContribution;
import com.hoang.basis.yukihon.system.dictionary.entity.DictContributionVote;
import com.hoang.basis.yukihon.system.dictionary.repository.DictContributionRepository;
import com.hoang.basis.yukihon.system.dictionary.repository.DictContributionVoteRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Community contributions (meanings/examples) for dictionary words, with per-user voting. */
@Service
@RequiredArgsConstructor
@Transactional
public class DictContributionService {

    private final DictContributionRepository contributionRepository;
    private final DictContributionVoteRepository voteRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DictContributionDto> list(Long userId, String headword) {
        String hw = headword == null ? "" : headword.trim();
        if (hw.isEmpty()) {
            return List.of();
        }
        List<DictContribution> items = contributionRepository.findByHeadword(hw);
        if (items.isEmpty()) {
            return List.of();
        }

        List<Long> ids = items.stream().map(DictContribution::getId).toList();
        Map<Long, Integer> myVotes = voteRepository.findByUserIdAndContributionIdIn(userId, ids).stream()
                .collect(Collectors.toMap(DictContributionVote::getContributionId, DictContributionVote::getValue));
        Map<Long, String> names =
                userRepository
                        .findAllById(items.stream()
                                .map(DictContribution::getUserId)
                                .distinct()
                                .toList())
                        .stream()
                        .collect(Collectors.toMap(User::getId, User::getDisplayName));

        return items.stream()
                .sorted(Comparator.comparingInt((DictContribution c) -> score(c))
                        .reversed()
                        .thenComparing(DictContribution::getCreatedAt, Comparator.reverseOrder()))
                .map(c -> toDto(c, userId, myVotes.getOrDefault(c.getId(), 0), names.get(c.getUserId())))
                .toList();
    }

    public DictContributionDto create(Long userId, CreateContributionRequest request) {
        String type = "EXAMPLE".equalsIgnoreCase(request.type()) ? "EXAMPLE" : "MEANING";
        DictContribution c = DictContribution.builder()
                .headword(request.headword().trim())
                .type(type)
                .content(request.content().trim())
                .translation(
                        request.translation() != null ? request.translation().trim() : null)
                .userId(userId)
                .upvotes(0)
                .downvotes(0)
                .build();
        c = contributionRepository.save(c);
        return toDto(c, userId, 0, displayName(userId));
    }

    /** Set the user's vote (1/-1) or clear it (0); recomputes counts. */
    public DictContributionDto vote(Long userId, Long contributionId, Integer value) {
        DictContribution c = contributionRepository
                .findById(contributionId)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution not found: " + contributionId));

        int v = value == null ? 0 : Integer.signum(value);
        DictContributionVote existing = voteRepository
                .findByContributionIdAndUserId(contributionId, userId)
                .orElse(null);
        if (v == 0) {
            if (existing != null) {
                voteRepository.delete(existing);
            }
        } else if (existing != null) {
            existing.setValue(v);
            voteRepository.save(existing);
        } else {
            voteRepository.save(DictContributionVote.builder()
                    .contributionId(contributionId)
                    .userId(userId)
                    .value(v)
                    .build());
        }

        c.setUpvotes(voteRepository.countByContributionIdAndValue(contributionId, 1));
        c.setDownvotes(voteRepository.countByContributionIdAndValue(contributionId, -1));
        c = contributionRepository.save(c);
        return toDto(c, userId, v, displayName(c.getUserId()));
    }

    public void delete(Long userId, Long contributionId) {
        DictContribution c = contributionRepository
                .findById(contributionId)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution not found: " + contributionId));
        if (!c.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not your contribution");
        }
        voteRepository.deleteByContributionId(contributionId);
        contributionRepository.delete(c);
    }

    private int score(DictContribution c) {
        return nvl(c.getUpvotes()) - nvl(c.getDownvotes());
    }

    private int nvl(Integer v) {
        return v != null ? v : 0;
    }

    private String displayName(Long userId) {
        return userRepository.findById(userId).map(User::getDisplayName).orElse(null);
    }

    private DictContributionDto toDto(DictContribution c, Long currentUserId, int myVote, String displayName) {
        return new DictContributionDto(
                c.getId(),
                c.getHeadword(),
                c.getType(),
                c.getContent(),
                c.getTranslation(),
                c.getUserId(),
                displayName,
                nvl(c.getUpvotes()),
                nvl(c.getDownvotes()),
                myVote,
                c.getUserId().equals(currentUserId),
                c.getCreatedAt());
    }
}
