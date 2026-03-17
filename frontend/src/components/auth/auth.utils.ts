export const BG_KANJI = [
  { char: "学", x: "8%", y: "15%", size: "text-[8rem]" },
  { char: "雪", x: "42%", y: "85%", size: "text-[9rem]" },
  { char: "書", x: "75%", y: "70%", size: "text-[7rem]" },
  { char: "読", x: "85%", y: "20%", size: "text-[6rem]" },
];

export const PARTICLES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: 4 + Math.random() * 6,
  delay: Math.random() * 10,
  duration: 10 + Math.random() * 10,
  drift: (Math.random() - 0.5) * 50,
  type: (Math.random() > 0.6 ? "sakura" : "orb") as "sakura" | "orb",
}));

export const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
};

export const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
export const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-400", "bg-emerald-500"];
