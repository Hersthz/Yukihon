export type StoryDifficultyLevel = "EASY" | "STANDARD" | "HARD";

export interface StoryCheckpointOption {
  id: string;
  label: string;
  nextSegmentId?: string;
  nextSegmentIdByDifficulty?: Partial<Record<StoryDifficultyLevel, string>>;
  difficultyImpact?: "EASE_UP" | "EASE_DOWN" | "NEUTRAL";
  response?: string;
}

export interface StoryCheckpoint {
  mode?: "quiz" | "branch";
  question: string;
  questionByDifficulty?: Partial<Record<StoryDifficultyLevel, string>>;
  options: StoryCheckpointOption[];
  optionsByDifficulty?: Partial<Record<StoryDifficultyLevel, StoryCheckpointOption[]>>;
  correctOptionId?: string;
  explanation: string;
  explanationByDifficulty?: Partial<Record<StoryDifficultyLevel, string>>;
}

export interface StoryGrammarNote {
  pattern: string;
  title: string;
  explanation: string;
}

export interface StorySegment {
  id: string;
  title: string;
  sceneHint: string;
  japaneseText: string;
  translation: string;
  translationByDifficulty?: Partial<Record<StoryDifficultyLevel, string>>;
  vocabQueries: string[];
  grammar: StoryGrammarNote[];
  checkpoint: StoryCheckpoint;
  adaptiveRoutes?: {
    onCorrectNextSegmentId?: string;
    onWrongNextSegmentId?: string;
    onCorrectByDifficulty?: Partial<Record<StoryDifficultyLevel, string>>;
    onWrongByDifficulty?: Partial<Record<StoryDifficultyLevel, string>>;
  };
  nextSegmentId?: string;
}

export interface StoryModeStory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  jlptLevel: string;
  estimatedMinutes: number;
  tone: string;
  coverLabel: string;
  entrySegmentId: string;
  segments: StorySegment[];
}

export const storyModeStories: StoryModeStory[] = [
  {
    id: "winter-library",
    title: "Winter Library Walk",
    subtitle: "Một buổi sáng yên tĩnh trước giờ học",
    description: "Đọc một câu chuyện ngắn về tuyết, thư viện và thói quen học tiếng Nhật từng chút một.",
    jlptLevel: "N5",
    estimatedMinutes: 12,
    tone: "Calm",
    coverLabel: "Snow",
    entrySegmentId: "winter-library-1",
    segments: [
      {
        id: "winter-library-1",
        title: "Đoạn 1",
        sceneHint: "Buổi sáng mùa đông",
        japaneseText: "朝、雪が静かに降っていました。",
        translation: "Buổi sáng, tuyết đang rơi rất nhẹ.",
        vocabQueries: ["朝", "雪", "静か"],
        grammar: [
          {
            pattern: "〜ていました",
            title: "Hành động đang diễn ra trong quá khứ",
            explanation: "Dùng để mô tả một trạng thái hoặc hành động đang tiếp diễn tại một thời điểm trong quá khứ.",
          },
        ],
        checkpoint: {
          question: "Mẫu nào trong câu cho biết một hành động đang diễn ra trong quá khứ?",
          options: [
            { id: "a", label: "静か" },
            { id: "b", label: "降っていました" },
            { id: "c", label: "朝" },
          ],
          correctOptionId: "b",
          explanation: "「降っていました」là dạng ていました, nhấn mạnh trạng thái tuyết đang rơi ở một thời điểm trong quá khứ.",
        },
        nextSegmentId: "winter-library-2",
      },
      {
        id: "winter-library-2",
        title: "Đoạn 2",
        sceneHint: "Ghé qua thư viện",
        japaneseText: "美咲は学校へ行く前に、駅の近くの小さな図書館へ寄りました。",
        translation: "Misaki ghé vào thư viện nhỏ gần nhà ga trước khi tới trường.",
        vocabQueries: ["学校", "駅", "図書館"],
        grammar: [
          {
            pattern: "〜前に",
            title: "Trước khi làm gì",
            explanation: "Dùng để nói một hành động xảy ra trước một hành động khác.",
          },
        ],
        checkpoint: {
          question: "Trong câu này, Misaki ghé vào thư viện vào lúc nào?",
          questionByDifficulty: {
            EASY: "Gợi ý: nhìn vào cụm 「前に」. Misaki ghé vào thư viện vào lúc nào?",
            HARD: "Cụm nào trong câu quy định chính xác thứ tự thời gian của hành động ghé thư viện?",
          },
          options: [
            { id: "a", label: "Sau khi tan học" },
            { id: "b", label: "Trước khi đến trường" },
            { id: "c", label: "Lúc đang ở nhà ga" },
          ],
          correctOptionId: "b",
          explanation: "Cụm 「学校へ行く前に」có nghĩa là trước khi đi đến trường.",
          explanationByDifficulty: {
            EASY: "Đúng rồi. 「前に」là trước khi, nên Misaki ghé thư viện trước khi đến trường.",
            HARD: "「前に」thiết lập thứ tự thời gian: hành động ghé thư viện xảy ra trước sự kiện đến trường.",
          },
        },
        adaptiveRoutes: {
          onWrongNextSegmentId: "winter-library-2-review",
        },
        nextSegmentId: "winter-library-3",
      },
      {
        id: "winter-library-2-review",
        title: "Đoạn 2.1 - Review nhanh",
        sceneHint: "Ôn lại trước khi đi tiếp",
        japaneseText: "先生は黒板に「学校へ行く前に、朝ごはんを食べます」と書いてくれました。",
        translation: "Giáo viên viết lên bảng: 'Trước khi đi học, em ăn sáng.'",
        vocabQueries: ["黒板", "朝ごはん", "食べる"],
        grammar: [
          {
            pattern: "〜前に",
            title: "Ôn lại thứ tự thời gian",
            explanation: "Phần A + 前に + phần B có nghĩa là B diễn ra trước A.",
          },
        ],
        checkpoint: {
          question: "Trong câu mẫu, hành động nào xảy ra trước?",
          questionByDifficulty: {
            EASY: "Gợi ý: từ khóa là 朝ごはん. Hành động nào xảy ra trước?",
          },
          options: [
            { id: "a", label: "Đi học trước" },
            { id: "b", label: "Ăn sáng trước" },
            { id: "c", label: "Hai hành động đồng thời" },
          ],
          correctOptionId: "b",
          explanation: "Vì có 「学校へ行く前に」nên ăn sáng xảy ra trước khi đi học.",
        },
        nextSegmentId: "winter-library-3",
      },
      {
        id: "winter-library-3",
        title: "Đoạn 3",
        sceneHint: "Kế hoạch học tập",
        japaneseText: "今日は新しい本を借りて、日本語で短い日記を書くつもりです。",
        translation: "Hôm nay cô ấy định mượn một cuốn sách mới và viết một nhật ký ngắn bằng tiếng Nhật.",
        vocabQueries: ["本", "借りる", "日記"],
        grammar: [
          {
            pattern: "〜つもりです",
            title: "Dự định làm gì",
            explanation: "Dùng để diễn tả dự định hoặc kế hoạch mà người nói đã có sẵn.",
          },
        ],
        checkpoint: {
          question: "Mẫu nào diễn tả dự định của người nói?",
          questionByDifficulty: {
            EASY: "Gợi ý: hãy tìm cụm kết thúc bằng つもりです. Đáp án nào đúng?",
            HARD: "Trong câu này, marker nào biểu thị ý định đã được lập trước đó, không phải hành động ngẫu hứng?",
          },
          options: [
            { id: "a", label: "借りて" },
            { id: "b", label: "短い" },
            { id: "c", label: "書くつもりです" },
          ],
          optionsByDifficulty: {
            HARD: [
              { id: "a", label: "借りて" },
              { id: "b", label: "短い" },
              { id: "c", label: "書くつもりです" },
              { id: "d", label: "日本語で" },
            ],
          },
          correctOptionId: "c",
          explanation: "「書くつもりです」có nghĩa là dự định viết, diễn tả kế hoạch sắp làm.",
          explanationByDifficulty: {
            HARD: "「つもりです」nhấn mạnh một kế hoạch đã có chủ đích. Các thành phần còn lại không tạo nghĩa ý định.",
          },
        },
        adaptiveRoutes: {
          onCorrectByDifficulty: {
            HARD: "winter-library-3-challenge",
          },
        },
        nextSegmentId: "winter-library-4",
      },
      {
        id: "winter-library-3-challenge",
        title: "Đoạn 3.1 - Challenge",
        sceneHint: "Tăng độ khó theo nhịp học",
        japaneseText: "時間が少なくても、毎日二、三文だけでも書き続けるつもりです。",
        translation: "Dù ít thời gian, cô ấy vẫn dự định tiếp tục viết mỗi ngày chỉ 2-3 câu.",
        translationByDifficulty: {
          HARD: "Đọc không cần bản dịch: tập trung vào cụm 書き続けるつもりです.",
        },
        vocabQueries: ["時間", "書き続ける", "毎日"],
        grammar: [
          {
            pattern: "〜続ける",
            title: "Tiếp tục làm gì",
            explanation: "Ghép động từ dạng masu bỏ ます + 続ける để nhấn mạnh hành động duy trì liên tục.",
          },
          {
            pattern: "〜つもりです",
            title: "Ý định rõ ràng",
            explanation: "Khi kết hợp với 続ける, ý định mang tính cam kết dài hạn hơn.",
          },
        ],
        checkpoint: {
          question: "Cụm nào trong câu thể hiện cam kết tiếp tục lâu dài?",
          options: [
            { id: "a", label: "時間が少なくても" },
            { id: "b", label: "二、三文だけでも" },
            { id: "c", label: "書き続けるつもりです" },
          ],
          correctOptionId: "c",
          explanation: "「続ける」+「つもりです」kết hợp thành một ý định có tính bền bỉ và duy trì đều đặn.",
        },
        nextSegmentId: "winter-library-4",
      },
      {
        id: "winter-library-4",
        title: "Đoạn 4",
        sceneHint: "Lời động viên",
        japaneseText: "図書館で先生に会って、「毎日少しずつでいいですよ」と言われました。",
        translation: "Ở thư viện, cô ấy gặp giáo viên và được nói rằng: 'Mỗi ngày chỉ cần một ít thôi cũng tốt rồi.'",
        vocabQueries: ["先生", "毎日", "少しずつ"],
        grammar: [
          {
            pattern: "〜でいい",
            title: "Chỉ cần như vậy là được",
            explanation: "Dùng để diễn tả một mức độ vừa đủ, không cần quá nhiều.",
          },
        ],
        checkpoint: {
          question: "Thông điệp chính mà giáo viên muốn gửi gắm là gì?",
          options: [
            { id: "a", label: "Phải học thật nhanh mới tốt" },
            { id: "b", label: "Học đều từng ít mới quan trọng" },
            { id: "c", label: "Chỉ nên học ở thư viện" },
          ],
          correctOptionId: "b",
          explanation: "Cụm 「毎日少しずつでいい」nhấn mạnh việc học đều và vừa sức mới là điều quan trọng.",
        },
      },
    ],
  },
  {
    id: "festival-night",
    title: "Lantern Night",
    subtitle: "Một đêm lễ hội có rẽ nhánh theo lựa chọn của bạn",
    description: "Bạn quyết định Kenta sẽ đi đâu trước ở lễ hội. Mỗi nhánh mở một cụm vocab và grammar khác nhau rồi mới hội tụ lại.",
    jlptLevel: "N4",
    estimatedMinutes: 16,
    tone: "Warm",
    coverLabel: "Lantern",
    entrySegmentId: "festival-night-1",
    segments: [
      {
        id: "festival-night-1",
        title: "Mở cảnh",
        sceneHint: "Đêm lễ hội bắt đầu",
        japaneseText: "夕方になると、商店街には赤いちょうちんが並び始めました。",
        translation: "Khi trời về chiều, đèn lồng đỏ bắt đầu sáng lên dọc khu phố mua sắm.",
        vocabQueries: ["夕方", "商店街", "ちょうちん"],
        grammar: [
          {
            pattern: "〜始めました",
            title: "Bắt đầu làm gì",
            explanation: "Dùng để mô tả một hành động vừa bắt đầu ở khoảnh khắc đó.",
          },
        ],
        checkpoint: {
          question: "Không khí của đoạn mở đầu này được gợi ra như thế nào?",
          options: [
            { id: "a", label: "Yên lặng và vắng vẻ" },
            { id: "b", label: "Bắt đầu nhộn nhịp và sáng đèn" },
            { id: "c", label: "Sắp trời mưa lớn" },
          ],
          correctOptionId: "b",
          explanation: "Cụm 「並び始めました」gợi cảm giác lễ hội đang bắt đầu lên đèn và đông hơn.",
        },
        nextSegmentId: "festival-night-2",
      },
      {
        id: "festival-night-2",
        title: "Chọn hướng đi",
        sceneHint: "Bạn sẽ rẽ qua quầy nào trước?",
        japaneseText: "健太は友だちを待ちながら、「先にたこ焼きを買おうか、それとも金魚すくいを見に行こうか」と考えました。",
        translation: "Trong lúc chờ bạn, Kenta nghĩ: 'Mình nên mua takoyaki trước hay đi xem trò vớt cá vàng trước nhỉ?'",
        vocabQueries: ["友だち", "たこ焼き", "金魚すくい"],
        grammar: [
          {
            pattern: "〜ようか",
            title: "Hay làm gì nhỉ?",
            explanation: "Dùng khi tự hỏi mình hoặc đề nghị nhẹ nhàng một lựa chọn sắp tới.",
          },
        ],
        checkpoint: {
          mode: "branch",
          question: "Bạn muốn dẫn Kenta đi theo nhánh nào?",
          options: [
            {
              id: "food",
              label: "Rẽ vào quầy takoyaki trước",
              nextSegmentId: "festival-night-food",
              response: "Kenta rẽ vào khu đồ ăn, vì mùi thơm của takoyaki làm buổi tối lễ hội có cảm giác ấm hơn và gần gũi hơn.",
            },
            {
              id: "game",
              label: "Rẽ qua trò vớt cá vàng trước",
              nextSegmentId: "festival-night-game",
              response: "Kenta rẽ sang khu trò chơi, nơi không khí lễ hội sống động hơn và nhiều tiếng trẻ con cười đùa hơn.",
            },
          ],
          explanation: "Mỗi lựa chọn sẽ mở một nhánh học khác nhau, với vocab và grammar riêng.",
        },
      },
      {
        id: "festival-night-food",
        title: "Nhánh A: Mùi takoyaki",
        sceneHint: "Khu đồ ăn nóng hổi",
        japaneseText: "屋台の前に立つと、健太はたこ焼きの匂いを楽しみながら、友だちにも一つ買ってあげたいと思いました。",
        translation: "Đứng trước quầy hàng, Kenta vừa tận hưởng mùi takoyaki vừa nghĩ rằng cũng muốn mua một phần cho bạn mình.",
        vocabQueries: ["屋台", "匂い", "買ってあげる"],
        grammar: [
          {
            pattern: "〜ながら",
            title: "Vừa làm A vừa làm B",
            explanation: "Dùng để nói hai hành động xảy ra cùng lúc; hành động ở vế sau là trọng tâm hơn.",
          },
          {
            pattern: "〜たいと思いました",
            title: "Đã thấy muốn làm gì",
            explanation: "Dùng khi mô tả mong muốn vừa xuất hiện trong tình huống đó.",
          },
        ],
        checkpoint: {
          question: "Ở nhánh này, tâm trạng của Kenta được nhấn mạnh ở điểm nào?",
          options: [
            { id: "a", label: "Cậu ấy vội vàng và mệt mỏi" },
            { id: "b", label: "Cậu ấy ấm áp và muốn chia sẻ với bạn" },
            { id: "c", label: "Cậu ấy chỉ quan tâm đến pháo hoa" },
          ],
          correctOptionId: "b",
          explanation: "Cụm 「友だちにも一つ買ってあげたい」cho thấy Kenta muốn chia sẻ sự vui vẻ với bạn mình.",
        },
        nextSegmentId: "festival-night-finale",
      },
      {
        id: "festival-night-game",
        title: "Nhánh B: Bể cá vàng",
        sceneHint: "Khu trò chơi rộn tiếng cười",
        japaneseText: "子どもたちの声を聞いて、健太も金魚すくいを一度やってみたいと思いました。",
        translation: "Nghe tiếng bọn trẻ reo vui, Kenta cũng thấy muốn thử trò vớt cá vàng một lần.",
        vocabQueries: ["子どもたち", "声", "やってみたい"],
        grammar: [
          {
            pattern: "〜てみたい",
            title: "Muốn thử làm gì",
            explanation: "Dùng để diễn tả mong muốn thử trải nghiệm một hành động lần đầu hoặc một cách mới.",
          },
        ],
        checkpoint: {
          question: "Grammar nào là trọng tâm của nhánh này?",
          options: [
            { id: "a", label: "〜てみたい" },
            { id: "b", label: "〜前に" },
            { id: "c", label: "〜つもりです" },
          ],
          correctOptionId: "a",
          explanation: "「やってみたい」diễn tả mong muốn thử sức với một trải nghiệm mới.",
        },
        nextSegmentId: "festival-night-finale",
      },
      {
        id: "festival-night-finale",
        title: "Hội tụ: Dưới pháo hoa",
        sceneHint: "Hai nhánh cùng gặp lại",
        japaneseText: "友だちが来たら、一緒に花火を見ることにしようと話していました。",
        translation: "Khi bạn đến, họ quyết định sẽ cùng nhau đi xem pháo hoa.",
        vocabQueries: ["一緒に", "花火", "話す"],
        grammar: [
          {
            pattern: "〜ことにしよう",
            title: "Hãy quyết định làm gì đó",
            explanation: "Dùng khi một nhóm người cùng chốt sẽ làm một việc nào đó từ bây giờ.",
          },
        ],
        checkpoint: {
          question: "Sau khi đi qua nhánh của riêng mình, nhóm bạn cuối cùng quyết định làm gì?",
          options: [
            { id: "a", label: "Về nhà ngay" },
            { id: "b", label: "Cùng nhau xem pháo hoa" },
            { id: "c", label: "Tìm thêm trò chơi khác" },
          ],
          correctOptionId: "b",
          explanation: "Dù đi qua nhánh nào, câu chuyện cuối cùng vẫn hội tụ tại quyết định cùng nhau đi xem pháo hoa.",
        },
      },
    ],
  },
];
