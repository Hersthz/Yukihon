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
        title: "Doan 1",
        sceneHint: "Buoi sang mua dong",
        japaneseText: "朝、雪が静かに降っていました。",
        translation: "Buổi sáng, tuyết rơi rất nhẹ.",
        vocabQueries: ["朝", "雪", "静か"],
        grammar: [
          {
            pattern: "〜ていました",
            title: "Hanh dong dang dien ra trong qua khu",
            explanation: "Dung de mo ta mot trang thai hoac hanh dong dang tiep dien tai mot thoi diem trong qua khu.",
          },
        ],
        checkpoint: {
          question: "Mau nao trong cau cho biet mot hanh dong dang dien ra trong qua khu?",
          options: [
            { id: "a", label: "静か" },
            { id: "b", label: "降っていました" },
            { id: "c", label: "朝" },
          ],
          correctOptionId: "b",
          explanation: "「降っていました」la dang ていました, nhan manh trang thai dang dien ra o mot thoi diem trong qua khu.",
        },
        nextSegmentId: "winter-library-2",
      },
      {
        id: "winter-library-2",
        title: "Doan 2",
        sceneHint: "Ghe qua thu vien",
        japaneseText: "美咲は学校へ行く前に、駅の近くの小さな図書館へ寄りました。",
        translation: "Misaki ghé vào thư viện nhỏ gần nhà ga trước khi tới trường.",
        vocabQueries: ["学校", "駅", "図書館"],
        grammar: [
          {
            pattern: "〜前に",
            title: "Truoc khi lam gi",
            explanation: "Dung de noi mot hanh dong xay ra truoc mot hanh dong khac.",
          },
        ],
        checkpoint: {
          question: "Trong cau nay, Misaki ghe vao thu vien vao luc nao?",
          questionByDifficulty: {
            EASY: "Goi y: nhin vao cum 〜前に. Misaki ghe vao thu vien vao luc nao?",
            HARD: "Cum nao trong cau quy dinh thu tu thoi gian chinh xac cua hanh dong ghe thu vien?",
          },
          options: [
            { id: "a", label: "Sau khi tan hoc" },
            { id: "b", label: "Truoc khi den truong" },
            { id: "c", label: "Luc dang o nha ga" },
          ],
          correctOptionId: "b",
          explanation: "Cum 「学校へ行く前に」co nghia la truoc khi di den truong.",
          explanationByDifficulty: {
            EASY: "Dung roi. 「前に」la truoc khi, nen Misaki ghe thu vien truoc khi den truong.",
            HARD: "「前に」thiet lap thu tu thoi gian: hanh dong ghe thu vien xay ra truoc su kien den truong.",
          },
        },
        adaptiveRoutes: {
          onWrongNextSegmentId: "winter-library-2-review",
        },
        nextSegmentId: "winter-library-3",
      },
      {
        id: "winter-library-2-review",
        title: "Doan 2.1 - Review nhanh",
        sceneHint: "On lai truoc khi di tiep",
        japaneseText: "先生は黒板に「学校へ行く前に、朝ごはんを食べます」と書いてくれました。",
        translation: "Giáo viên viết lên bảng: 'Trước khi đi học, em ăn sáng.'",
        vocabQueries: ["黒板", "朝ごはん", "食べる"],
        grammar: [
          {
            pattern: "〜前に",
            title: "On lai thu tu thoi gian",
            explanation: "Phan A + 前に + phan B co nghia la B dien ra truoc A.",
          },
        ],
        checkpoint: {
          question: "Trong cau mau, hanh dong nao xay ra truoc?",
          questionByDifficulty: {
            EASY: "Goi y: tu khoa la 朝ごはん. Hanh dong nao xay ra truoc?",
          },
          options: [
            { id: "a", label: "Di hoc truoc" },
            { id: "b", label: "An sang truoc" },
            { id: "c", label: "Hai hanh dong dong thoi" },
          ],
          correctOptionId: "b",
          explanation: "Vi co 「学校へ行く前に」nen an sang xay ra truoc khi di hoc.",
        },
        nextSegmentId: "winter-library-3",
      },
      {
        id: "winter-library-3",
        title: "Doan 3",
        sceneHint: "Ke hoach hoc tap",
        japaneseText: "今日は新しい本を借りて、日本語で短い日記を書くつもりです。",
        translation: "Hôm nay cô ấy định mượn một cuốn sách mới và viết một nhật ký ngắn bằng tiếng Nhật.",
        vocabQueries: ["本", "借りる", "日記"],
        grammar: [
          {
            pattern: "〜つもりです",
            title: "Du dinh lam gi",
            explanation: "Dung de dien ta du dinh hoac ke hoach ma nguoi noi da co san.",
          },
        ],
        checkpoint: {
          question: "Mau nao dien ta du dinh cua nguoi noi?",
          questionByDifficulty: {
            EASY: "Goi y: hay tim cum ket thuc bang つもりです. Dap an nao dung?",
            HARD: "Trong cau nay, marker nao bieu thi y dinh da duoc lap truoc do, khong phai hanh dong ngau hung?",
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
          explanation: "「書くつもりです」co nghia la du dinh viet, dien ta ke hoach sap lam.",
          explanationByDifficulty: {
            HARD: "「つもりです」nhan manh mot ke hoach da co chu dich. Cac thanh phan con lai khong tao nghia y dinh.",
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
        title: "Doan 3.1 - Challenge",
        sceneHint: "Tang do kho theo nhip hoc",
        japaneseText: "時間が少なくても、毎日二、三文だけでも書き続けるつもりです。",
        translation: "Dù ít thời gian, cô ấy vẫn dự định tiếp tục viết mỗi ngày chỉ 2-3 câu.",
        translationByDifficulty: {
          HARD: "Doc khong can ban dich: tap trung vao cum 書き続けるつもりです.",
        },
        vocabQueries: ["時間", "書き続ける", "毎日"],
        grammar: [
          {
            pattern: "〜続ける",
            title: "Tiep tuc lam gi",
            explanation: "Ghep dong tu dang masu bo ます + 続ける de nhan manh hanh dong duy tri lien tuc.",
          },
          {
            pattern: "〜つもりです",
            title: "Y dinh ro rang",
            explanation: "Khi ket hop voi 続ける, y dinh mang tinh cam ket dai han hon.",
          },
        ],
        checkpoint: {
          question: "Cum nao trong cau the hien cam ket tiep tuc lau dai?",
          options: [
            { id: "a", label: "時間が少なくても" },
            { id: "b", label: "二、三文だけでも" },
            { id: "c", label: "書き続けるつもりです" },
          ],
          correctOptionId: "c",
          explanation: "「続ける」+「つもりです」ket hop thanh mot y dinh co tinh ben bi va duy tri deu dan.",
        },
        nextSegmentId: "winter-library-4",
      },
      {
        id: "winter-library-4",
        title: "Doan 4",
        sceneHint: "Loi dong vien",
        japaneseText: "図書館で先生に会って、「毎日少しずつでいいですよ」と言われました。",
        translation: "Ở thư viện, cô ấy gặp giáo viên và được nói rằng 'Mỗi ngày chỉ cần một ít thôi cũng tốt rồi.'",
        vocabQueries: ["先生", "毎日", "少しずつ"],
        grammar: [
          {
            pattern: "〜でいい",
            title: "Chi can nhu vay la duoc",
            explanation: "Dung de dien ta mot muc do vua du, khong can qua nhieu.",
          },
        ],
        checkpoint: {
          question: "Thong diep chinh ma giao vien muon gui gam la gi?",
          options: [
            { id: "a", label: "Phai hoc that nhanh moi tot" },
            { id: "b", label: "Hoc deu tung it moi quan trong" },
            { id: "c", label: "Chi nen hoc o thu vien" },
          ],
          correctOptionId: "b",
          explanation: "Cum 「毎日少しずつでいい」nhan manh viec hoc deu va vua suc moi la dieu quan trong.",
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
        title: "Mo canh",
        sceneHint: "Dem le hoi bat dau",
        japaneseText: "夕方になると、商店街には赤いちょうちんが並び始めました。",
        translation: "Khi trời về chiều, đèn lồng đỏ bắt đầu sáng lên dọc khu phố mua sắm.",
        vocabQueries: ["夕方", "商店街", "ちょうちん"],
        grammar: [
          {
            pattern: "〜始めました",
            title: "Bat dau lam gi",
            explanation: "Dung de mo ta mot hanh dong vua bat dau o khoanh khac do.",
          },
        ],
        checkpoint: {
          question: "Khong khi cua doan mo dau nay duoc goi ra nhu the nao?",
          options: [
            { id: "a", label: "Yen lang va vang ve" },
            { id: "b", label: "Bat dau nhon nhip va sang den" },
            { id: "c", label: "Sap troi mua lon" },
          ],
          correctOptionId: "b",
          explanation: "Cum 「並び始めました」goi cam giac le hoi dang bat dau len den va dong hon.",
        },
        nextSegmentId: "festival-night-2",
      },
      {
        id: "festival-night-2",
        title: "Chon huong di",
        sceneHint: "Ban se re qua quay nao truoc?",
        japaneseText: "健太は友だちを待ちながら、「先にたこ焼きを買おうか、それとも金魚すくいを見に行こうか」と考えました。",
        translation: "Trong lúc chờ bạn, Kenta nghĩ: 'Mình nên mua takoyaki trước hay đi xem trò vớt cá vàng trước nhỉ?'",
        vocabQueries: ["友だち", "たこ焼き", "金魚すくい"],
        grammar: [
          {
            pattern: "〜ようか",
            title: "Hay lam gi nhe?",
            explanation: "Dung khi tu hoi minh hoac de nghi nhe nhang mot lua chon sap toi.",
          },
        ],
        checkpoint: {
          mode: "branch",
          question: "Ban muon dan Kenta di theo nhanh nao?",
          options: [
            {
              id: "food",
              label: "Re vao quay takoyaki truoc",
              nextSegmentId: "festival-night-food",
              response: "Kenta re vao khu do an, vi mui thom cua takoyaki lam buoi toi le hoi co cam giac am hon va gan gui hon.",
            },
            {
              id: "game",
              label: "Re qua tro vot ca vang truoc",
              nextSegmentId: "festival-night-game",
              response: "Kenta re sang khu tro choi, noi khong khi le hoi song dong hon va nhieu am thanh tre con cuoi dua hon.",
            },
          ],
          explanation: "Moi lua chon se mo mot nhanh hoc khac nhau, voi vocab va grammar rieng.",
        },
      },
      {
        id: "festival-night-food",
        title: "Nhanh A: Mui takoyaki",
        sceneHint: "Khu do an nong hoi",
        japaneseText: "屋台の前に立つと、健太はたこ焼きの匂いを楽しみながら、友だちにも一つ買ってあげたいと思いました。",
        translation: "Đứng trước quầy hàng, Kenta vừa tận hưởng mùi takoyaki vừa nghĩ rằng cũng muốn mua một phần cho bạn mình.",
        vocabQueries: ["屋台", "匂い", "買ってあげる"],
        grammar: [
          {
            pattern: "〜ながら",
            title: "Vua lam A vua lam B",
            explanation: "Dung de noi hai hanh dong xay ra cung luc; hanh dong o ve sau la trong tam hon.",
          },
          {
            pattern: "〜たいと思いました",
            title: "Da thay muon lam gi",
            explanation: "Dung khi mo ta mong muon vua xuat hien trong tinh huong do.",
          },
        ],
        checkpoint: {
          question: "O nhanh nay, tam trang cua Kenta duoc nhan manh o diem nao?",
          options: [
            { id: "a", label: "Cau ay voi vang va met moi" },
            { id: "b", label: "Cau ay am ap va muon chia se voi ban" },
            { id: "c", label: "Cau ay chi quan tam den phao hoa" },
          ],
          correctOptionId: "b",
          explanation: "Cum 「友だちにも一つ買ってあげたい」cho thay Kenta muon chia se su vui ve voi ban minh.",
        },
        nextSegmentId: "festival-night-finale",
      },
      {
        id: "festival-night-game",
        title: "Nhanh B: Be ca vang",
        sceneHint: "Khu tro choi rong tieng cuoi",
        japaneseText: "子どもたちの声を聞いて、健太も金魚すくいを一度やってみたいと思いました。",
        translation: "Nghe tiếng bọn trẻ reo vui, Kenta cũng thấy muốn thử trò vớt cá vàng một lần.",
        vocabQueries: ["子どもたち", "声", "やってみたい"],
        grammar: [
          {
            pattern: "〜てみたい",
            title: "Muon thu lam gi",
            explanation: "Dung de dien ta mong muon thu trai nghiem mot hanh dong lan dau hoac mot cach moi.",
          },
        ],
        checkpoint: {
          question: "Grammar nao la trong tam cua nhanh nay?",
          options: [
            { id: "a", label: "〜てみたい" },
            { id: "b", label: "〜前に" },
            { id: "c", label: "〜つもりです" },
          ],
          correctOptionId: "a",
          explanation: "「やってみたい」dien ta mong muon thu suc voi mot trai nghiem moi.",
        },
        nextSegmentId: "festival-night-finale",
      },
      {
        id: "festival-night-finale",
        title: "Hoi tu: Duoi phao hoa",
        sceneHint: "Hai nhanh cung gap lai",
        japaneseText: "友だちが来たら、一緒に花火を見ることにしようと話していました。",
        translation: "Khi bạn đến, họ quyết định sẽ cùng nhau đi xem pháo hoa.",
        vocabQueries: ["一緒に", "花火", "話す"],
        grammar: [
          {
            pattern: "〜ことにしよう",
            title: "Hay quyet dinh lam gi do",
            explanation: "Dung khi mot nhom nguoi cung chot se lam mot viec nao do tu bay gio.",
          },
        ],
        checkpoint: {
          question: "Sau khi di qua nhanh cua rieng minh, nhom ban cuoi cung quyet dinh lam gi?",
          options: [
            { id: "a", label: "Ve nha ngay" },
            { id: "b", label: "Cung nhau xem phao hoa" },
            { id: "c", label: "Tim them tro choi khac" },
          ],
          correctOptionId: "b",
          explanation: "Du di qua nhanh nao, cau chuyen cuoi cung van hoi tu tai quyet dinh cung nhau di xem phao hoa.",
        },
      },
    ],
  },
];
