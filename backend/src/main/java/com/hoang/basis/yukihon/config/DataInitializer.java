package com.hoang.basis.yukihon.config;

import com.hoang.basis.yukihon.system.grammar.entity.Grammar;
import com.hoang.basis.yukihon.system.grammar.repository.GrammarRepository;
import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import com.hoang.basis.yukihon.system.quiz.entity.Quiz;
import com.hoang.basis.yukihon.system.quiz.repository.QuizRepository;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.userlearningstats.repository.UserLearningStatsRepository;
import com.hoang.basis.yukihon.system.usersettings.repository.UserSettingsRepository;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import com.hoang.basis.yukihon.system.vocabulary.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final UserLearningStatsRepository userLearningStatsRepository;

    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final QuizRepository quizRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializeUsers();
        initializeLessons();
        initializeVocabulary();
        initializeGrammar();
        initializeQuizzes();
        log.info("Data initialization completed");
    }

    private void initializeUsers() {
        User admin = ensureUser(
                "admin@yukihon.local",
                "Admin Yukihon",
                "Admin@123",
                Set.of(RoleName.ADMIN, RoleName.USER),
                true
        );

        User user = ensureUser(
                "learner@yukihon.local",
                "Learner Demo",
                "User@123",
                Set.of(RoleName.USER),
                true
        );

        ensureUserArtifacts(admin);
        ensureUserArtifacts(user);

        long totalUsers = userRepository.count();
        log.info("Initialized users: {} total", totalUsers);
        log.info("Default credentials -> admin: admin@yukihon.local / Admin@123");
        log.info("Default credentials -> user: learner@yukihon.local / User@123");
    }

    private User ensureUser(
            String email,
            String displayName,
            String rawPassword,
            Set<RoleName> roles,
            boolean enabled
    ) {
        return userRepository.findByEmail(email)
                .map(existing -> {
                    if (existing.getRoles() == null || existing.getRoles().isEmpty()) {
                        existing.setRoles(new HashSet<>(roles));
                    }
                    existing.setEnabled(enabled);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    User created = User.builder()
                            .email(email)
                            .displayName(displayName)
                            .password(passwordEncoder.encode(rawPassword))
                            .enabled(enabled)
                            .roles(new HashSet<>(roles))
                            .build();
                    return userRepository.save(created);
                });
    }

    private void ensureUserArtifacts(User user) {
        userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> userSettingsRepository.save(
                        com.hoang.basis.yukihon.system.usersettings.entity.UserSettings.builder()
                                .user(user)
                                .build()
                ));

        userLearningStatsRepository.findByUserId(user.getId())
                .orElseGet(() -> userLearningStatsRepository.save(
                        com.hoang.basis.yukihon.system.userlearningstats.entity.UserLearningStats.builder()
                                .user(user)
                                .totalXP(0)
                                .currentStreak(0)
                                .longestStreak(0)
                                .lessonsCompleted(0)
                                .quizzesCompleted(0)
                                .vocabularyLearned(0)
                                .grammarLearned(0)
                                .totalLearningMinutes(0)
                                .targetJLPTLevel("N5")
                                .build()
                ));
    }

    private void initializeLessons() {
        if (lessonRepository.count() > 0) {
            return;
        }

        List<Lesson> lessons = List.of(
                Lesson.builder()
                        .title("N5 Greetings and Self Introduction")
                        .description("Learn essential phrases for greeting and introducing yourself in Japanese")
                        .content("Topics: hello expressions, asking names, saying where you are from, basic polite endings.")
                        .jlptLevel("N5")
                        .category("conversation")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(1)
                        .build(),
                Lesson.builder()
                        .title("N5 Particles: wa, ga, o")
                        .description("Master the most common particles for sentence building")
                        .content("Use wa for topic, ga for subject focus, and o for direct object.")
                        .jlptLevel("N5")
                        .category("grammar")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(2)
                        .build(),
                Lesson.builder()
                        .title("N4 Daily Activities")
                        .description("Talk about routines, time, and frequency")
                        .content("Sentence structures for daily schedule and routine description.")
                        .jlptLevel("N4")
                        .category("conversation")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(3)
                        .build(),
                Lesson.builder()
                        .title("N4 Verb Te-form in Context")
                        .description("Apply te-form for requests, linking actions, and permissions")
                        .content("Patterns include -te kudasai, -te mo ii, and -te wa ikemasen.")
                        .jlptLevel("N4")
                        .category("grammar")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(4)
                        .build(),
                Lesson.builder()
                        .title("N3 Opinion and Reasoning")
                        .description("Express personal opinions and reasons naturally")
                        .content("Use structures like to omoimasu and node/kara for arguments.")
                        .jlptLevel("N3")
                        .category("speaking")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(5)
                        .build(),
                Lesson.builder()
                        .title("N3 Reading Strategy Practice")
                        .description("Improve reading speed with paragraph-level strategy")
                        .content("Skimming, scanning keywords, and extracting main points.")
                        .jlptLevel("N3")
                        .category("reading")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(6)
                        .build()
        );

        lessonRepository.saveAll(lessons);
        log.info("Initialized lessons: {} records", lessons.size());
    }

    private void initializeVocabulary() {
        if (vocabularyRepository.count() > 0) {
            return;
        }

        List<Vocabulary> vocabulary = List.of(
                Vocabulary.builder()
                        .kanji("学校")
                        .hiragana("がっこう")
                        .romaji("gakkou")
                        .meaning("school")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("わたしは学校へ行きます。")
                        .exampleSentenceEN("I go to school.")
                        .build(),
                Vocabulary.builder()
                        .kanji("先生")
                        .hiragana("せんせい")
                        .romaji("sensei")
                        .meaning("teacher")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("先生はやさしいです。")
                        .exampleSentenceEN("The teacher is kind.")
                        .build(),
                Vocabulary.builder()
                        .kanji("勉強")
                        .hiragana("べんきょう")
                        .romaji("benkyou")
                        .meaning("study")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("毎日日本語を勉強します。")
                        .exampleSentenceEN("I study Japanese every day.")
                        .build(),
                Vocabulary.builder()
                        .kanji("経験")
                        .hiragana("けいけん")
                        .romaji("keiken")
                        .meaning("experience")
                        .wordType("noun")
                        .jlptLevel("N4")
                        .exampleSentenceJP("いい経験になりました。")
                        .exampleSentenceEN("It became a good experience.")
                        .build(),
                Vocabulary.builder()
                        .kanji("提案")
                        .hiragana("ていあん")
                        .romaji("teian")
                        .meaning("proposal, suggestion")
                        .wordType("noun")
                        .jlptLevel("N3")
                        .exampleSentenceJP("新しい提案があります。")
                        .exampleSentenceEN("I have a new proposal.")
                        .build(),
                Vocabulary.builder()
                        .kanji("結果")
                        .hiragana("けっか")
                        .romaji("kekka")
                        .meaning("result")
                        .wordType("noun")
                        .jlptLevel("N3")
                        .exampleSentenceJP("試験の結果を見ました。")
                        .exampleSentenceEN("I checked the exam result.")
                        .build()
        );

        vocabularyRepository.saveAll(vocabulary);
        log.info("Initialized vocabulary: {} records", vocabulary.size());
    }

    private void initializeGrammar() {
        if (grammarRepository.count() > 0) {
            return;
        }

        List<Grammar> grammar = List.of(
                Grammar.builder()
                        .title("Basic Copula")
                        .pattern("です")
                        .explanation("Polite sentence ending for stating identity or qualities.")
                        .usage("Noun + です / Adjective + です")
                        .exampleJP("私は学生です。")
                        .exampleEN("I am a student.")
                        .jlptLevel("N5")
                        .relatedPatterns("だ,ではありません")
                        .build(),
                Grammar.builder()
                        .title("Existence")
                        .pattern("あります / います")
                        .explanation("Use あります for things and います for living beings.")
                        .usage("Place + に + Noun + が + あります/います")
                        .exampleJP("部屋に猫がいます。")
                        .exampleEN("There is a cat in the room.")
                        .jlptLevel("N5")
                        .relatedPatterns("に,が")
                        .build(),
                Grammar.builder()
                        .title("Permission")
                        .pattern("〜てもいいです")
                        .explanation("Used to ask or grant permission.")
                        .usage("Verb te-form + もいいです")
                        .exampleJP("ここで写真を撮ってもいいですか。")
                        .exampleEN("May I take photos here?")
                        .jlptLevel("N4")
                        .relatedPatterns("〜てはいけません")
                        .build(),
                Grammar.builder()
                        .title("Progressive and State")
                        .pattern("〜ている")
                        .explanation("Indicates ongoing action or resulting state depending on verb type.")
                        .usage("Verb te-form + いる")
                        .exampleJP("今、本を読んでいます。")
                        .exampleEN("I am reading a book now.")
                        .jlptLevel("N4")
                        .relatedPatterns("〜てある")
                        .build(),
                Grammar.builder()
                        .title("Opinion Expression")
                        .pattern("〜と思います")
                        .explanation("Express personal opinion or belief.")
                        .usage("Clause + と思います")
                        .exampleJP("日本語は面白いと思います。")
                        .exampleEN("I think Japanese is interesting.")
                        .jlptLevel("N3")
                        .relatedPatterns("〜と言っています")
                        .build(),
                Grammar.builder()
                        .title("Giving Reasons")
                        .pattern("〜ので")
                        .explanation("Polite and softer reason connector compared to から.")
                        .usage("Clause + ので")
                        .exampleJP("雨なので、家にいます。")
                        .exampleEN("Because it is raining, I stay home.")
                        .jlptLevel("N3")
                        .relatedPatterns("〜から")
                        .build()
        );

        grammarRepository.saveAll(grammar);
        log.info("Initialized grammar: {} records", grammar.size());
    }

    private void initializeQuizzes() {
        if (quizRepository.count() > 0) {
            return;
        }

        List<Quiz> quizzes = List.of(
                Quiz.builder()
                        .title("N5 Basic Greetings Quiz")
                        .description("Choose the best Japanese greeting for each context")
                        .quizType(Quiz.QuizType.MULTIPLE_CHOICE)
                        .difficultyLevel("BEGINNER")
                        .jlptLevel("N5")
                        .question("What is the most common greeting for 'Good morning'?")
                        .options("[\"こんにちは\",\"こんばんは\",\"おはようございます\",\"さようなら\"]")
                        .correctAnswer("おはようございます")
                        .explanation("おはようございます is the standard polite morning greeting.")
                        .build(),
                Quiz.builder()
                        .title("N5 Particle Selection")
                        .description("Select the correct particle")
                        .quizType(Quiz.QuizType.FILL_IN_BLANK)
                        .difficultyLevel("BEGINNER")
                        .jlptLevel("N5")
                        .question("私は日本語__勉強します。")
                        .options("[\"が\",\"を\",\"に\",\"で\"]")
                        .correctAnswer("を")
                        .explanation("を marks the direct object in this sentence.")
                        .build(),
                Quiz.builder()
                        .title("N4 Permission Pattern")
                        .description("Apply grammar pattern 〜てもいいです")
                        .quizType(Quiz.QuizType.MULTIPLE_CHOICE)
                        .difficultyLevel("INTERMEDIATE")
                        .jlptLevel("N4")
                        .question("Which sentence asks permission correctly?")
                        .options("[\"入ってはいけませんか\",\"入ってもいいですか\",\"入るのでいいですか\",\"入っているですか\"]")
                        .correctAnswer("入ってもいいですか")
                        .explanation("〜てもいいですか is used to ask for permission.")
                        .build(),
                Quiz.builder()
                        .title("N4 Daily Routine Listening")
                        .description("Listening style comprehension question")
                        .quizType(Quiz.QuizType.LISTENING)
                        .difficultyLevel("INTERMEDIATE")
                        .jlptLevel("N4")
                        .question("In a daily routine audio, what time does the speaker start work?")
                        .options("[\"7:00\",\"8:00\",\"9:00\",\"10:00\"]")
                        .correctAnswer("9:00")
                        .explanation("The speaker says 'kuji ni shigoto o hajimemasu' (start work at 9).")
                        .audioUrl("https://example.com/audio/n4-routine-01.mp3")
                        .build(),
                Quiz.builder()
                        .title("N3 Opinion Grammar")
                        .description("Interpret opinion expression")
                        .quizType(Quiz.QuizType.MULTIPLE_CHOICE)
                        .difficultyLevel("ADVANCED")
                        .jlptLevel("N3")
                        .question("What nuance does 〜と思います mainly add?")
                        .options("[\"Strong command\",\"Objective fact only\",\"Personal opinion\",\"Past completion\"]")
                        .correctAnswer("Personal opinion")
                        .explanation("〜と思います marks personal viewpoint or judgment.")
                        .build(),
                Quiz.builder()
                        .title("N3 Reason Connectors")
                        .description("Choose the best connector for a soft reason")
                        .quizType(Quiz.QuizType.FILL_IN_BLANK)
                        .difficultyLevel("ADVANCED")
                        .jlptLevel("N3")
                        .question("時間がない__、急ぎましょう。")
                        .options("[\"ので\",\"でも\",\"しか\",\"ほど\"]")
                        .correctAnswer("ので")
                        .explanation("ので expresses a reason in a softer, explanatory tone.")
                        .build()
        );

        quizRepository.saveAll(quizzes);
        log.info("Initialized quizzes: {} records", quizzes.size());
    }
}
