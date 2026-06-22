import type { LearningPathResponse, MistakeDnaResponse, MyWordsStats } from "@/api";

export type StudyAuraMode = "STORY" | "REVIEW" | "RESCUE" | "LESSON";

export interface StudyAuraAction {
  label: string;
  to: string;
}

export interface StudyAuraSnapshot {
  mode: StudyAuraMode;
  ambientLabel: string;
  title: string;
  description: string;
  primaryAction: StudyAuraAction;
  secondaryAction: StudyAuraAction;
  signals: string[];
  ritual: string[];
}

interface StudyAuraInput {
  learningPath?: LearningPathResponse | null;
  mistakeDna?: MistakeDnaResponse | null;
  wordStats?: MyWordsStats | null;
  hour?: number;
}

const getAmbientLabel = (hour: number) => {
  if (hour < 12) return "Morning Build";
  if (hour < 18) return "Daylight Flow";
  return "Night Focus";
};

export const buildStudyAura = ({
  learningPath,
  mistakeDna,
  wordStats,
  hour = new Date().getHours(),
}: StudyAuraInput): StudyAuraSnapshot => {
  const dueReviews = wordStats?.dueTodayCount ?? mistakeDna?.dueReviews ?? 0;
  const riskScore = mistakeDna?.overallRiskScore ?? 0;
  const quizAccuracy = mistakeDna?.averageQuizAccuracy ?? 0;
  const currentStreak = learningPath?.currentStreak ?? 0;
  const inProgressLessons = learningPath?.inProgressLessons ?? mistakeDna?.inProgressLessons ?? 0;
  const nextLesson = learningPath?.nextLesson ?? null;
  const ambientLabel = getAmbientLabel(hour);

  if (riskScore >= 72 || dueReviews >= 8) {
    return {
      mode: "RESCUE",
      ambientLabel,
      title: "Hom nay nen cuu loi truoc",
      description: `${riskScore}% risk score va ${dueReviews} review den han cho thay tri nho dang bi nen. Neu giai toa cho nay truoc, ca buoi hoc se nhe hon nhieu.`,
      primaryAction: { label: "Mo Mistake DNA", to: "/mistake-dna" },
      secondaryAction: { label: "On My Words truoc", to: "/my-words" },
      signals: [
        `${riskScore}% risk score`,
        `${dueReviews} review den han`,
        `${quizAccuracy}% quiz accuracy`,
      ],
      ritual: [
        "Doc dominant pattern va next move trong 1 phut.",
        "On 5-10 muc due trong My Words.",
        "Sau do moi mo quiz hoac lesson moi.",
      ],
    };
  }

  if (dueReviews >= 4) {
    return {
      mode: "REVIEW",
      ambientLabel,
      title: "Nhip dep nhat luc nay la on vocab",
      description: `${dueReviews} the dang cho ban quay lai. Day la luc tot de giu nhip tri nho truoc khi hoc them noi dung moi.`,
      primaryAction: { label: "Mo My Words", to: "/my-words" },
      secondaryAction: { label: "Xem Story Mode", to: "/story-mode" },
      signals: [
        `${dueReviews} due reviews`,
        `${wordStats?.kanjiDueTodayCount ?? 0} kanji due`,
        `${wordStats?.masteredCount ?? 0} da mastered`,
      ],
      ritual: [
        "On nhanh mot vong Again / Hard / Good.",
        "Chon 1-2 tu muon giu lai lau hon.",
        "Neu con luc, mo 1 doan truyen ngan de dung lai ngay.",
      ],
    };
  }

  if (currentStreak >= 3 && riskScore <= 50) {
    return {
      mode: "STORY",
      ambientLabel,
      title: "Hom nay hop de hoc qua truyen",
      description: `Streak ${currentStreak} ngay va risk score dang em. Day la luc tot de hoc trong boi canh, de vocab va grammar di vao nhe hon.`,
      primaryAction: { label: "Mo Story Mode", to: "/story-mode" },
      secondaryAction: {
        label: nextLesson ? "Quay lai lesson" : "Mo JLPT",
        to: nextLesson ? `/lessons/${nextLesson.id}` : "/jlpt-lessons",
      },
      signals: [
        `${currentStreak} ngay streak`,
        `${learningPath?.completionRate ?? 0}% track hoan thanh`,
        `${dueReviews} due reviews`,
      ],
      ritual: [
        "Doc 1 doan, mo khoa 1 checkpoint.",
        "Luu 1-2 vocab hay vao My Words.",
        "Dong buoi hoc bang 1 quiz ngan hoac 1 lesson tiep theo.",
      ],
    };
  }

  return {
    mode: "LESSON",
    ambientLabel,
    title: nextLesson ? "Hom nay nen bam lesson chinh" : "Hom nay nen mo lai lo trinh",
    description: nextLesson
      ? `Ban dang co mot lesson phu hop de di tiep mach hoc hien tai. Day la cach nhanh nhat de giu track khong bi dut doan.`
      : `Chua co lesson tiep theo ro rang, nhung lo trinh JLPT san sang de ban mo mot track moi.`,
    primaryAction: {
      label: nextLesson ? "Hoc tiep lesson" : "Mo lo trinh",
      to: nextLesson ? `/lessons/${nextLesson.id}` : "/jlpt-lessons",
    },
    secondaryAction: { label: "Xem Story Mode", to: "/story-mode" },
    signals: [
      `${inProgressLessons} bai dang hoc`,
      `${learningPath?.dailyGoalMinutes ?? 15} phut muc tieu`,
      `${learningPath?.targetJlptLevel ?? "N5"} muc tieu JLPT`,
    ],
    ritual: [
      "Mo lesson chinh truoc khi doi context.",
      "Dung Story Mode neu muon warm-up nhe hon.",
      "Ket buoi bang 1 vong review ngan.",
    ],
  };
};
