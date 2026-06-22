package com.hoang.basis.yukihon.config;

import com.hoang.basis.yukihon.system.grammar.entity.Grammar;
import com.hoang.basis.yukihon.system.grammar.repository.GrammarRepository;
import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.DeckItem;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import com.hoang.basis.yukihon.system.quiz.entity.Quiz;
import com.hoang.basis.yukihon.system.quiz.repository.QuizRepository;
import com.hoang.basis.yukihon.system.srs.entity.SrsAlgorithmConfig;
import com.hoang.basis.yukihon.system.srs.repository.SrsAlgorithmConfigRepository;
import com.hoang.basis.yukihon.system.user.entity.Permission;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.RolePermission;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.PermissionRepository;
import com.hoang.basis.yukihon.system.user.repository.RolePermissionRepository;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.userlearningstats.repository.UserLearningStatsRepository;
import com.hoang.basis.yukihon.system.usersettings.repository.UserSettingsRepository;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import com.hoang.basis.yukihon.system.vocabulary.repository.VocabularyRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final UserLearningStatsRepository userLearningStatsRepository;

    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final QuizRepository quizRepository;

    private final SrsAlgorithmConfigRepository srsAlgorithmConfigRepository;
    private final DeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final DeckItemRepository deckItemRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializePermissions();
        initializeUsers();
        initializeLessons();
        initializeVocabulary();
        initializeGrammar();
        initializeQuizzes();
        initializeSrsConfig();
        initializeDemoDeck();
        log.info("Data initialization completed");
    }

    private void initializeSrsConfig() {
        if (srsAlgorithmConfigRepository.findByCode("SM2_DEFAULT").isEmpty()) {
            SrsAlgorithmConfig sm2 = new SrsAlgorithmConfig();
            sm2.setCode("SM2_DEFAULT");
            sm2.setName("SM-2 (Anki-like)");
            sm2.setAlgorithmType("SM2");
            sm2.setEnabled(true);
            sm2.setConfigJson("{"
                    + "\"learningSteps\":[1,10],"
                    + "\"relearningSteps\":[10],"
                    + "\"graduatingIntervalDays\":1,"
                    + "\"easyIntervalDays\":4,"
                    + "\"startingEase\":2.5,"
                    + "\"minEase\":1.3,"
                    + "\"easyBonus\":1.3,"
                    + "\"hardInterval\":1.2,"
                    + "\"intervalModifier\":1.0,"
                    + "\"newInterval\":0.0,"
                    + "\"maxIntervalDays\":36500}");
            srsAlgorithmConfigRepository.save(sm2);
            log.info("Initialized SRS algorithm config: SM2_DEFAULT");
        }
    }

    private void initializeDemoDeck() {
        User learner = userRepository.findByEmail("learner@yukihon.local").orElse(null);
        if (learner == null) {
            return;
        }
        if (!deckRepository
                .findByUserIdAndIsDeletedFalseOrderByUpdatedAtDesc(learner.getId())
                .isEmpty()) {
            return;
        }

        Deck deck = new Deck();
        deck.setUserId(learner.getId());
        deck.setTitle("N5 Starter Deck");
        deck.setDescription("Bộ thẻ N5 cơ bản để bắt đầu học theo SRS.");
        deck.setVisibility("PUBLIC");
        deck.setSourceLanguage("ja");
        deck.setTargetLanguage("vi");
        Deck savedDeck = deckRepository.save(deck);

        String[][] cards = {
            {"学校", "がっこう", "school / trường học"},
            {"先生", "せんせい", "teacher / giáo viên"},
            {"水", "みず", "water / nước"},
            {"食べる", "たべる", "to eat / ăn"},
            {"友達", "ともだち", "friend / bạn bè"},
            {"今日", "きょう", "today / hôm nay"},
            {"勉強", "べんきょう", "study / học tập"},
            {"電車", "でんしゃ", "train / tàu điện"}
        };

        int order = 0;
        for (String[] c : cards) {
            Flashcard fc = new Flashcard();
            fc.setCardType("BASIC");
            fc.setItemType("VOCAB");
            fc.setFront(c[0]);
            fc.setBack(c[2]);
            fc.setHint(c[1]);
            Flashcard savedFc = flashcardRepository.save(fc);

            DeckItem item = new DeckItem();
            item.setDeckId(savedDeck.getId());
            item.setFlashcardId(savedFc.getId());
            item.setOrderIndex(order++);
            deckItemRepository.save(item);
        }

        savedDeck.setTotalCards(cards.length);
        deckRepository.save(savedDeck);
        log.info(
                "Initialized demo deck '{}' with {} cards (deckId={})",
                savedDeck.getTitle(),
                cards.length,
                savedDeck.getId());
    }

    private void initializePermissions() {
        Permission userReadProfile =
                ensurePermission("USER_READ_PROFILE", "Read Profile", "View own account and profile information");
        Permission userUpdateProfile =
                ensurePermission("USER_UPDATE_PROFILE", "Update Profile", "Update own profile and account settings");
        Permission contentRead = ensurePermission(
                "CONTENT_READ", "Read Learning Content", "Read lessons, grammar, vocabulary, and quizzes");
        Permission contentManage = ensurePermission(
                "CONTENT_MANAGE",
                "Manage Learning Content",
                "Create, edit, and delete lessons, grammar, vocabulary, and quizzes");
        Permission contentReview = ensurePermission(
                "CONTENT_REVIEW",
                "Review Learning Content",
                "Review and approve creator submissions before admin publishing");
        Permission contentPublish = ensurePermission(
                "CONTENT_PUBLISH",
                "Publish Learning Content",
                "Perform final publish decision for creator submissions");
        Permission communityInteract = ensurePermission(
                "COMMUNITY_INTERACT", "Community Interactions", "Create posts, comment, and react in community");
        Permission translationUse = ensurePermission(
                "TRANSLATION_USE", "Use Translation", "Use translation APIs and access translation history");
        Permission adminDashboardRead = ensurePermission(
                "ADMIN_DASHBOARD_READ", "Read Admin Dashboard", "Access system stats and admin dashboard overview");
        Permission adminUsersManage =
                ensurePermission("ADMIN_USERS_MANAGE", "Manage Users", "Manage user status, roles, and account state");
        Permission adminRolesManage =
                ensurePermission("ADMIN_ROLES_MANAGE", "Manage Roles", "Assign and revoke roles for users");

        ensureRolePermission(RoleName.USER, userReadProfile);
        ensureRolePermission(RoleName.USER, userUpdateProfile);
        ensureRolePermission(RoleName.USER, contentRead);
        ensureRolePermission(RoleName.USER, communityInteract);
        ensureRolePermission(RoleName.USER, translationUse);

        ensureRolePermission(RoleName.ADMIN, userReadProfile);
        ensureRolePermission(RoleName.ADMIN, userUpdateProfile);
        ensureRolePermission(RoleName.ADMIN, contentRead);
        ensureRolePermission(RoleName.ADMIN, contentManage);
        ensureRolePermission(RoleName.ADMIN, contentReview);
        ensureRolePermission(RoleName.ADMIN, contentPublish);
        ensureRolePermission(RoleName.ADMIN, communityInteract);
        ensureRolePermission(RoleName.ADMIN, translationUse);
        ensureRolePermission(RoleName.ADMIN, adminDashboardRead);
        ensureRolePermission(RoleName.ADMIN, adminUsersManage);
        ensureRolePermission(RoleName.ADMIN, adminRolesManage);

        log.info("Initialized permissions: {} records", permissionRepository.count());
        log.info("Initialized role-permission mappings: {} records", rolePermissionRepository.count());
    }

    private void initializeUsers() {
        User admin = ensureUser(
                "admin@yukihon.local", "Admin Yukihon", "Admin@123", Set.of(RoleName.ADMIN, RoleName.USER), true);

        User user = ensureUser("learner@yukihon.local", "Learner Demo", "User@123", Set.of(RoleName.USER), true);

        ensureUserArtifacts(admin);
        ensureUserArtifacts(user);

        long totalUsers = userRepository.count();
        log.info("Initialized users: {} total", totalUsers);
        log.info("Default credentials -> admin: admin@yukihon.local / Admin@123");
        log.info("Default credentials -> user: learner@yukihon.local / User@123");
    }

    private User ensureUser(
            String email, String displayName, String rawPassword, Set<RoleName> roles, boolean enabled) {
        return userRepository
                .findByEmail(email)
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

    private Permission ensurePermission(String code, String name, String description) {
        return permissionRepository
                .findByCode(code)
                .orElseGet(() -> permissionRepository.save(Permission.builder()
                        .code(code)
                        .name(name)
                        .description(description)
                        .build()));
    }

    private void ensureRolePermission(RoleName role, Permission permission) {
        boolean exists = rolePermissionRepository.existsByRoleAndPermission(role, permission);
        if (exists) {
            return;
        }

        rolePermissionRepository.save(
                RolePermission.builder().role(role).permission(permission).build());
    }

    private void ensureUserArtifacts(User user) {
        userSettingsRepository
                .findByUserId(user.getId())
                .orElseGet(() -> userSettingsRepository.save(
                        com.hoang.basis.yukihon.system.usersettings.entity.UserSettings.builder()
                                .user(user)
                                .build()));

        userLearningStatsRepository
                .findByUserId(user.getId())
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
                                .build()));
    }

    private void initializeLessons() {
        if (lessonRepository.count() > 0) {
            return;
        }

        List<Lesson> lessons = List.of(
                Lesson.builder()
                        .title("N5 Greetings and Self Introduction")
                        .description("Learn essential phrases for greeting and introducing yourself in Japanese")
                        .content(
                                "Topics: hello expressions, asking names, saying where you are from, basic polite endings.")
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
                        .build(),
                Lesson.builder()
                        .title("N5 Numbers and Counting")
                        .description("Count objects, people, and money in Japanese")
                        .content("Native numbers 1-10, Sino-Japanese numbers, and common counters (つ, 人, 円).")
                        .jlptLevel("N5")
                        .category("vocabulary")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(7)
                        .build(),
                Lesson.builder()
                        .title("N5 Days, Months and Time")
                        .description("Tell the date, day of week, and time")
                        .content("Days of the week, 月 for months, and reading clock time with 時 and 分.")
                        .jlptLevel("N5")
                        .category("vocabulary")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(8)
                        .build(),
                Lesson.builder()
                        .title("N4 Te-form Mastery")
                        .description("Connect actions and make requests with the te-form")
                        .content("Forming the te-form for all verb groups and using -te kudasai, -te imasu, -te mo ii.")
                        .jlptLevel("N4")
                        .category("grammar")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(9)
                        .build(),
                Lesson.builder()
                        .title("N3 Keigo Basics")
                        .description("Introduction to polite and humble speech")
                        .content("Sonkeigo and kenjougo basics for everyday business and service situations.")
                        .jlptLevel("N3")
                        .category("conversation")
                        .status(Lesson.LessonStatus.PUBLISHED)
                        .orderIndex(10)
                        .build());

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
                        .build(),
                Vocabulary.builder()
                        .kanji("水")
                        .hiragana("みず")
                        .romaji("mizu")
                        .meaning("water")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("水を飲みます。")
                        .exampleSentenceEN("I drink water.")
                        .build(),
                Vocabulary.builder()
                        .kanji("火")
                        .hiragana("ひ")
                        .romaji("hi")
                        .meaning("fire")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("火に気をつけてください。")
                        .exampleSentenceEN("Please be careful with fire.")
                        .build(),
                Vocabulary.builder()
                        .kanji("木")
                        .hiragana("き")
                        .romaji("ki")
                        .meaning("tree, wood")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("木が高いです。")
                        .exampleSentenceEN("The tree is tall.")
                        .build(),
                Vocabulary.builder()
                        .kanji("山")
                        .hiragana("やま")
                        .romaji("yama")
                        .meaning("mountain")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("山に登ります。")
                        .exampleSentenceEN("I climb the mountain.")
                        .build(),
                Vocabulary.builder()
                        .kanji("川")
                        .hiragana("かわ")
                        .romaji("kawa")
                        .meaning("river")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("川で泳ぎます。")
                        .exampleSentenceEN("I swim in the river.")
                        .build(),
                Vocabulary.builder()
                        .kanji("食べる")
                        .hiragana("たべる")
                        .romaji("taberu")
                        .meaning("to eat")
                        .wordType("verb")
                        .jlptLevel("N5")
                        .exampleSentenceJP("ご飯を食べます。")
                        .exampleSentenceEN("I eat rice.")
                        .build(),
                Vocabulary.builder()
                        .kanji("飲む")
                        .hiragana("のむ")
                        .romaji("nomu")
                        .meaning("to drink")
                        .wordType("verb")
                        .jlptLevel("N5")
                        .exampleSentenceJP("お茶を飲みます。")
                        .exampleSentenceEN("I drink tea.")
                        .build(),
                Vocabulary.builder()
                        .kanji("行く")
                        .hiragana("いく")
                        .romaji("iku")
                        .meaning("to go")
                        .wordType("verb")
                        .jlptLevel("N5")
                        .exampleSentenceJP("学校に行きます。")
                        .exampleSentenceEN("I go to school.")
                        .build(),
                Vocabulary.builder()
                        .kanji("来る")
                        .hiragana("くる")
                        .romaji("kuru")
                        .meaning("to come")
                        .wordType("verb")
                        .jlptLevel("N5")
                        .exampleSentenceJP("友達が来ます。")
                        .exampleSentenceEN("A friend is coming.")
                        .build(),
                Vocabulary.builder()
                        .kanji("見る")
                        .hiragana("みる")
                        .romaji("miru")
                        .meaning("to see, to watch")
                        .wordType("verb")
                        .jlptLevel("N5")
                        .exampleSentenceJP("映画を見ます。")
                        .exampleSentenceEN("I watch a movie.")
                        .build(),
                Vocabulary.builder()
                        .kanji("大きい")
                        .hiragana("おおきい")
                        .romaji("ookii")
                        .meaning("big")
                        .wordType("adjective")
                        .jlptLevel("N5")
                        .exampleSentenceJP("大きい家です。")
                        .exampleSentenceEN("It is a big house.")
                        .build(),
                Vocabulary.builder()
                        .kanji("小さい")
                        .hiragana("ちいさい")
                        .romaji("chiisai")
                        .meaning("small")
                        .wordType("adjective")
                        .jlptLevel("N5")
                        .exampleSentenceJP("小さい犬です。")
                        .exampleSentenceEN("It is a small dog.")
                        .build(),
                Vocabulary.builder()
                        .kanji("友達")
                        .hiragana("ともだち")
                        .romaji("tomodachi")
                        .meaning("friend")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("友達と話します。")
                        .exampleSentenceEN("I talk with a friend.")
                        .build(),
                Vocabulary.builder()
                        .kanji("家")
                        .hiragana("いえ")
                        .romaji("ie")
                        .meaning("house, home")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("家に帰ります。")
                        .exampleSentenceEN("I return home.")
                        .build(),
                Vocabulary.builder()
                        .kanji("車")
                        .hiragana("くるま")
                        .romaji("kuruma")
                        .meaning("car")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("車を運転します。")
                        .exampleSentenceEN("I drive a car.")
                        .build(),
                Vocabulary.builder()
                        .kanji("電車")
                        .hiragana("でんしゃ")
                        .romaji("densha")
                        .meaning("train")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("電車に乗ります。")
                        .exampleSentenceEN("I ride the train.")
                        .build(),
                Vocabulary.builder()
                        .kanji("時間")
                        .hiragana("じかん")
                        .romaji("jikan")
                        .meaning("time, hour")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("時間がありません。")
                        .exampleSentenceEN("I don't have time.")
                        .build(),
                Vocabulary.builder()
                        .kanji("今日")
                        .hiragana("きょう")
                        .romaji("kyou")
                        .meaning("today")
                        .wordType("noun")
                        .jlptLevel("N5")
                        .exampleSentenceJP("今日は晴れです。")
                        .exampleSentenceEN("Today is sunny.")
                        .build());

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
                        .build(),
                Grammar.builder()
                        .title("Desire")
                        .pattern("〜たい")
                        .explanation("Express what the speaker wants to do.")
                        .usage("Verb stem + たいです")
                        .exampleJP("日本へ行きたいです。")
                        .exampleEN("I want to go to Japan.")
                        .jlptLevel("N5")
                        .relatedPatterns("〜たくない")
                        .build(),
                Grammar.builder()
                        .title("Suggestion")
                        .pattern("〜ましょう")
                        .explanation("Invite or suggest doing something together.")
                        .usage("Verb stem + ましょう")
                        .exampleJP("一緒に行きましょう。")
                        .exampleEN("Let's go together.")
                        .jlptLevel("N5")
                        .relatedPatterns("〜ませんか")
                        .build(),
                Grammar.builder()
                        .title("Obligation")
                        .pattern("〜なければなりません")
                        .explanation("Express that something must be done.")
                        .usage("Verb nai-form (drop ない) + なければなりません")
                        .exampleJP("毎日勉強しなければなりません。")
                        .exampleEN("I must study every day.")
                        .jlptLevel("N4")
                        .relatedPatterns("〜なくてもいい")
                        .build(),
                Grammar.builder()
                        .title("Ability")
                        .pattern("〜ことができる")
                        .explanation("Express ability or possibility.")
                        .usage("Verb dictionary form + ことができます")
                        .exampleJP("日本語を話すことができます。")
                        .exampleEN("I can speak Japanese.")
                        .jlptLevel("N4")
                        .relatedPatterns("Potential form")
                        .build(),
                Grammar.builder()
                        .title("Past Experience")
                        .pattern("〜たことがある")
                        .explanation("Express having done something before.")
                        .usage("Verb ta-form + ことがあります")
                        .exampleJP("日本に行ったことがあります。")
                        .exampleEN("I have been to Japan.")
                        .jlptLevel("N4")
                        .relatedPatterns("〜たことがない")
                        .build(),
                Grammar.builder()
                        .title("Simultaneous Action")
                        .pattern("〜ながら")
                        .explanation("Do two actions at the same time.")
                        .usage("Verb stem + ながら")
                        .exampleJP("音楽を聞きながら勉強します。")
                        .exampleEN("I study while listening to music.")
                        .jlptLevel("N4")
                        .relatedPatterns("〜つつ")
                        .build());

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
                        .options(
                                "[\"Strong command\",\"Objective fact only\",\"Personal opinion\",\"Past completion\"]")
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
                        .build(),
                Quiz.builder()
                        .title("N5 Reading of 学校")
                        .description("Choose the correct reading")
                        .quizType(Quiz.QuizType.MULTIPLE_CHOICE)
                        .difficultyLevel("BEGINNER")
                        .jlptLevel("N5")
                        .question("「学校」の読み方はどれですか。")
                        .options("[\"がっこう\",\"がこう\",\"がくこう\",\"がっこ\"]")
                        .correctAnswer("がっこう")
                        .explanation("学校 is read がっこう (gakkou).")
                        .build(),
                Quiz.builder()
                        .title("N5 Word Meaning: water")
                        .description("Pick the word that means 'water'")
                        .quizType(Quiz.QuizType.MULTIPLE_CHOICE)
                        .difficultyLevel("BEGINNER")
                        .jlptLevel("N5")
                        .question("Which word means \"water\"?")
                        .options("[\"水\",\"火\",\"木\",\"山\"]")
                        .correctAnswer("水")
                        .explanation("水 (みず) means water.")
                        .build(),
                Quiz.builder()
                        .title("N5 Topic Particle")
                        .description("Select the correct particle")
                        .quizType(Quiz.QuizType.FILL_IN_BLANK)
                        .difficultyLevel("BEGINNER")
                        .jlptLevel("N5")
                        .question("わたし__学生です。")
                        .options("[\"は\",\"を\",\"に\",\"で\"]")
                        .correctAnswer("は")
                        .explanation("は marks the topic of the sentence.")
                        .build(),
                Quiz.builder()
                        .title("N5 Verb Meaning: to eat")
                        .description("Pick the verb meaning 'to eat'")
                        .quizType(Quiz.QuizType.MULTIPLE_CHOICE)
                        .difficultyLevel("BEGINNER")
                        .jlptLevel("N5")
                        .question("Which verb means \"to eat\"?")
                        .options("[\"飲む\",\"食べる\",\"見る\",\"行く\"]")
                        .correctAnswer("食べる")
                        .explanation("食べる (たべる) means to eat.")
                        .build(),
                Quiz.builder()
                        .title("N4 Ability Pattern")
                        .description("Complete the ability expression")
                        .quizType(Quiz.QuizType.FILL_IN_BLANK)
                        .difficultyLevel("INTERMEDIATE")
                        .jlptLevel("N4")
                        .question("日本語を話す__できます。")
                        .options("[\"ことが\",\"のが\",\"ように\",\"そうに\"]")
                        .correctAnswer("ことが")
                        .explanation("〜ことができる expresses ability.")
                        .build(),
                Quiz.builder()
                        .title("N4 Te-form of 食べる")
                        .description("Choose the correct te-form")
                        .quizType(Quiz.QuizType.MULTIPLE_CHOICE)
                        .difficultyLevel("INTERMEDIATE")
                        .jlptLevel("N4")
                        .question("「食べる」のて形はどれですか。")
                        .options("[\"食べて\",\"食べた\",\"食べない\",\"食べます\"]")
                        .correctAnswer("食べて")
                        .explanation("Ru-verbs drop る and add て: 食べて.")
                        .build());

        quizRepository.saveAll(quizzes);
        log.info("Initialized quizzes: {} records", quizzes.size());
    }
}
