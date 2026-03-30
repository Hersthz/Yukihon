export interface StoryCheckpointOption {
  id: string;
  label: string;
}

export interface StoryCheckpoint {
  question: string;
  options: StoryCheckpointOption[];
  correctOptionId: string;
  explanation: string;
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
  vocabQueries: string[];
  grammar: StoryGrammarNote[];
  checkpoint: StoryCheckpoint;
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
          options: [
            { id: "a", label: "Sau khi tan hoc" },
            { id: "b", label: "Truoc khi den truong" },
            { id: "c", label: "Luc dang o nha ga" },
          ],
          correctOptionId: "b",
          explanation: "Cum 「学校へ行く前に」co nghia la truoc khi di den truong.",
        },
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
          options: [
            { id: "a", label: "借りて" },
            { id: "b", label: "短い" },
            { id: "c", label: "書くつもりです" },
          ],
          correctOptionId: "c",
          explanation: "「書くつもりです」co nghia la du dinh viet, dien ta ke hoach sap lam.",
        },
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
    subtitle: "Một buổi tối lễ hội với bạn mới",
    description: "Theo doi mot dem le hoi nho, hoc cach mo ta am thanh, y dinh va loi moi don gian.",
    jlptLevel: "N4",
    estimatedMinutes: 14,
    tone: "Warm",
    coverLabel: "Lantern",
    segments: [
      {
        id: "festival-night-1",
        title: "Doan 1",
        sceneHint: "Den le hoi",
        japaneseText: "夕方になると、商店街には赤いちょうちんが並び始めました。",
        translation: "Khi trời về chiều, những chiếc đèn lồng đỏ bắt đầu được treo dọc khu phố mua sắm.",
        vocabQueries: ["夕方", "商店街", "ちょうちん"],
        grammar: [
          {
            pattern: "〜始めました",
            title: "Bat dau lam gi",
            explanation: "Dung de dien ta thoi diem mot hanh dong vua bat dau.",
          },
        ],
        checkpoint: {
          question: "Su viec nao bat dau xay ra trong doan nay?",
          options: [
            { id: "a", label: "Moi nguoi ra ve" },
            { id: "b", label: "Den long bat dau duoc treo len" },
            { id: "c", label: "Troi bat dau mua" },
          ],
          correctOptionId: "b",
          explanation: "「並び始めました」cho biet den long bat dau duoc xep/treo len.",
        },
      },
      {
        id: "festival-night-2",
        title: "Doan 2",
        sceneHint: "Hen gap ban moi",
        japaneseText: "健太は友だちを待ちながら、屋台のたこ焼きの匂いを楽しんでいました。",
        translation: "Kenta vừa chờ bạn vừa tận hưởng mùi thơm của takoyaki từ các quầy hàng.",
        vocabQueries: ["友だち", "屋台", "たこ焼き"],
        grammar: [
          {
            pattern: "〜ながら",
            title: "Vua lam A vua lam B",
            explanation: "Dung de noi hai hanh dong xay ra song song, trong do hanh dong chinh thuong o ve sau.",
          },
        ],
        checkpoint: {
          question: "Cum nao dien ta hai hanh dong xay ra cung luc?",
          options: [
            { id: "a", label: "待ちながら" },
            { id: "b", label: "楽しんでいました" },
            { id: "c", label: "匂いを" },
          ],
          correctOptionId: "a",
          explanation: "「待ちながら」su dung mau ながら, cho thay vua doi ban vua lam viec khac.",
        },
      },
      {
        id: "festival-night-3",
        title: "Doan 3",
        sceneHint: "Loi moi don gian",
        japaneseText: "友だちが来たら、一緒に花火を見ることにしようと話していました。",
        translation: "Họ bàn với nhau rằng khi bạn đến thì sẽ cùng đi xem pháo hoa.",
        vocabQueries: ["一緒に", "花火", "話す"],
        grammar: [
          {
            pattern: "〜ことにしよう",
            title: "Hay quyet dinh lam gi do",
            explanation: "Dung khi de xuat va cung nhau dua ra quyet dinh se lam mot viec.",
          },
        ],
        checkpoint: {
          question: "Nhom ban da quyet dinh lam gi?",
          options: [
            { id: "a", label: "Ve nha ngay" },
            { id: "b", label: "An them takoyaki" },
            { id: "c", label: "Cung nhau xem phao hoa" },
          ],
          correctOptionId: "c",
          explanation: "「花火を見ることにしよう」co nghia la hay quyet dinh cung nhau di xem phao hoa.",
        },
      },
    ],
  },
];
