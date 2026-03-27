package com.hoang.basis.yukihon.system.quiz.service;

import com.hoang.basis.yukihon.system.quiz.dto.QuizDto;
import com.hoang.basis.yukihon.system.quiz.dto.QuizRequest;
import com.hoang.basis.yukihon.system.quiz.entity.Quiz;
import com.hoang.basis.yukihon.system.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public QuizDto getQuizById(Long id) {
        return quizRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<QuizDto> getAll() {
        return quizRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizDto> getByType(String quizType) {
        return quizRepository.findByQuizType(Quiz.QuizType.valueOf(quizType))
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizDto> getByDifficultyLevel(String difficultyLevel) {
        return quizRepository.findByDifficultyLevel(difficultyLevel)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizDto> getByJlptLevel(String jlptLevel) {
        return quizRepository.findByJlptLevel(jlptLevel)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizDto> getByLessonId(Long lessonId) {
        return quizRepository.findByLessonIdOrderByCreatedAtAsc(lessonId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizDto> getByLevelAndDifficulty(String level, String difficulty) {
        return quizRepository.findByLevelAndDifficulty(level, difficulty)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllDifficultyLevels() {
        return quizRepository.findAllDifficultyLevels();
    }

    public QuizDto createQuiz(QuizRequest request) {
        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .quizType(Quiz.QuizType.valueOf(request.getQuizType()))
                .difficultyLevel(request.getDifficultyLevel())
                .jlptLevel(request.getJlptLevel())
                .lessonId(request.getLessonId())
                .question(request.getQuestion())
                .options(request.getOptions())
                .correctAnswer(request.getCorrectAnswer())
                .explanation(request.getExplanation())
                .audioUrl(request.getAudioUrl())
                .imageUrl(request.getImageUrl())
                .build();

        Quiz saved = quizRepository.save(quiz);
        log.info("Created quiz: {} with title: {}", saved.getId(), saved.getTitle());
        return convertToDto(saved);
    }

    public QuizDto updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setQuizType(Quiz.QuizType.valueOf(request.getQuizType()));
        quiz.setDifficultyLevel(request.getDifficultyLevel());
        quiz.setJlptLevel(request.getJlptLevel());
        quiz.setLessonId(request.getLessonId());
        quiz.setQuestion(request.getQuestion());
        quiz.setOptions(request.getOptions());
        quiz.setCorrectAnswer(request.getCorrectAnswer());
        quiz.setExplanation(request.getExplanation());
        quiz.setAudioUrl(request.getAudioUrl());
        quiz.setImageUrl(request.getImageUrl());

        Quiz updated = quizRepository.save(quiz);
        log.info("Updated quiz: {}", updated.getId());
        return convertToDto(updated);
    }

    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new RuntimeException("Quiz not found with id: " + id);
        }
        quizRepository.deleteById(id);
        log.info("Deleted quiz with id: {}", id);
    }

    private QuizDto convertToDto(Quiz quiz) {
        return QuizDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .quizType(quiz.getQuizType().toString())
                .difficultyLevel(quiz.getDifficultyLevel())
                .jlptLevel(quiz.getJlptLevel())
                .lessonId(quiz.getLessonId())
                .question(quiz.getQuestion())
                .options(quiz.getOptions())
                .correctAnswer(quiz.getCorrectAnswer())
                .explanation(quiz.getExplanation())
                .audioUrl(quiz.getAudioUrl())
                .imageUrl(quiz.getImageUrl())
                .build();
    }
}
