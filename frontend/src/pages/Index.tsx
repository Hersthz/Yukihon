import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Languages,
  MessageSquareText,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { WinterScene } from "@/components/winter";
import { useAuth } from "@/hooks/use-auth";
import { useWinterTheme } from "@/hooks/use-winter-theme";
import kaorukoHappy from "@/assets/kaoruko-happy.png";

const highlightCards = [
  {
    icon: Clock3,
    title: "Học theo nhịp của bạn",
    description:
      "Bài học ngắn, ôn nhanh và giao diện nhẹ nhàng giúp mỗi buổi học thoải mái thay vì quá tải.",
  },
  {
    icon: Brain,
    title: "Vòng ôn tập thông minh",
    description:
      "Từ điển, từ vựng, trắc nghiệm và Phân tích lỗi gắn kết thành một luồng học duy nhất.",
  },
  {
    icon: GraduationCap,
    title: "Bám sát JLPT",
    description: "Mọi phần của ứng dụng đều hỗ trợ lộ trình rõ ràng từ nền tảng N5 đến N1.",
  },
  {
    icon: Users,
    title: "Đồng hành cùng cộng đồng",
    description: "Học cùng nhau, hỏi đáp nhanh và giữ tương tác luôn hiển thị mà không rối mắt.",
  },
];

const levelCards = [
  { level: "N5", title: "Nền tảng", detail: "Kana, từ vựng cốt lõi, mẫu câu thiết yếu" },
  { level: "N4", title: "Tiếng Nhật hằng ngày", detail: "Hội thoại thường ngày và dựng câu" },
  { level: "N3", title: "Mạch trung cấp", detail: "Đọc, nghe tự nhiên hơn và nắm sắc thái" },
  {
    level: "N2",
    title: "Chiều sâu chuyên môn",
    detail: "Cấu trúc phức tạp, sẵn sàng cho công việc",
  },
  { level: "N1", title: "Thành thạo", detail: "Đọc nâng cao, chính xác và diễn đạt tinh tế" },
];

const featurePanels = [
  {
    title: "Từ điển và Sổ từ đi cùng nhau",
    description:
      "Lưu, ôn lại và quay về với từ vựng trở thành một thao tác liền mạch thay vì phải chuyển ngữ cảnh.",
    icon: BookOpen,
  },
  {
    title: "Tổng quan là trung tâm điều khiển",
    description:
      "Thống kê nhanh, bài học kế tiếp, tín hiệu học tập và lối tắt hiển thị trong một trang phân cấp rõ ràng.",
    icon: Target,
  },
  {
    title: "AI và dịch thuật chung ngôn ngữ thiết kế",
    description:
      "Trợ lý, không gian dịch và phần ngữ pháp dùng chung logic hiển thị, khoảng cách và bảng màu.",
    icon: Languages,
  },
];

const testimonials = [
  {
    quote: "Bố cục nhẹ nhàng, nhanh hơn và dễ lướt hơn nhiều khi mình chỉ có 15 phút để học.",
    author: "Mai Anh",
    role: "Học viên JLPT N4",
  },
  {
    quote:
      "Mình nhảy từ từ điển sang sổ từ rồi sang ôn trắc nghiệm mà không thấy như đang vào một sản phẩm khác.",
    author: "Khánh Linh",
    role: "Người tự học",
  },
  {
    quote: "Trang tổng quan giờ như một buồng lái học tập thay vì một mớ tiện ích rời rạc.",
    author: "Tuấn Hoàng",
    role: "Duy trì chuỗi học mỗi ngày",
  },
];

const HeroPreview = () => (
  <div className="winter-glass relative overflow-hidden p-4 sm:p-5">
    {/* window chrome */}
    <div className="flex items-center gap-2 pb-3">
      <span className="h-3 w-3 rounded-full" style={{ background: "#ff6b6b" }} />
      <span className="h-3 w-3 rounded-full" style={{ background: "#ffd23f" }} />
      <span className="h-3 w-3 rounded-full" style={{ background: "#3ad29f" }} />
      <span className="ml-3 text-xs font-medium text-muted-foreground">Tổng quan của bạn</span>
    </div>

    <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
      {/* progress card */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "hsl(var(--w-accent) / 0.08)",
          border: "1px solid hsl(var(--w-border))",
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tiến độ tuần này
          </p>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <p className="mt-2 text-3xl font-black text-foreground">65%</p>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full"
          style={{ background: "hsl(var(--w-border))" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--w-accent)), hsl(var(--w-accent-strong)))",
            }}
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
          />
        </div>

        {/* mini sparkline */}
        <svg
          className="mt-4 w-full"
          height="48"
          viewBox="0 0 200 48"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--w-accent))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(var(--w-accent))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 38 L25 30 L50 34 L75 20 L100 26 L125 12 L150 18 L175 8 L200 14 L200 48 L0 48 Z"
            fill="url(#spark)"
          />
          <path
            d="M0 38 L25 30 L50 34 L75 20 L100 26 L125 12 L150 18 L175 8 L200 14"
            stroke="hsl(var(--w-accent))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* stat tiles */}
      <div className="grid grid-rows-2 gap-3">
        <div className="winter-card flex flex-col justify-center p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Từ đã thuộc
          </p>
          <p className="text-2xl font-black text-foreground">1.230</p>
        </div>
        <div className="winter-card flex flex-col justify-center p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Chuỗi ngày
          </p>
          <p className="text-2xl font-black text-foreground">30 ngày</p>
        </div>
      </div>
    </div>

    {/* Kaoruko bubble */}
    <div
      className="mt-3 flex items-center gap-3 rounded-2xl p-3"
      style={{
        background: "hsl(var(--w-card-solid) / 0.6)",
        border: "1px solid hsl(var(--w-border))",
      }}
    >
      <div
        className="h-12 w-12 shrink-0 overflow-hidden rounded-full"
        style={{ border: "2px solid hsl(var(--w-accent) / 0.35)" }}
      >
        <img src={kaorukoHappy} alt="Kaoruko" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">Kaoruko đã sẵn sàng</p>
        <p className="truncate text-xs text-muted-foreground">
          Từ điển, luyện tập và gợi ý AI nay dùng chung một giao diện.
        </p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggle } = useWinterTheme();
  const ctaLink = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className={`winter overflow-hidden ${isDark ? "is-dark" : ""}`}>
      <WinterScene isDark={isDark} />
      <Navigation isDark={isDark} onToggleTheme={toggle} />

      <main className="relative pb-16 pt-28 sm:pt-32">
        {/* HERO */}
        <section id="hero" className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="winter-pill mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Trải nghiệm học mùa đông mới
              </span>

              <h1 className="text-[2.9rem] font-black leading-[1.02] tracking-tight text-foreground sm:text-[3.8rem] lg:text-[4.6rem]">
                Học tiếng Nhật,
                <br />
                <span className="text-primary">Mọi lúc,</span> Mọi nơi.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                Yukihon là không gian học tiếng Nhật tĩnh lặng như tuyết — từ điển đầy đủ, luyện
                JLPT, trắc nghiệm và bài tập nhập vai, tất cả trong một ngôn ngữ thiết kế nhất quán.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={ctaLink} className="winter-btn">
                  {isAuthenticated ? "Mở trang tổng quan" : "Bắt đầu học miễn phí"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/courses" className="winter-btn-ghost">
                  Khám phá lộ trình khóa học
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
                {[
                  { value: "10K+", label: "Từ vựng & bài học" },
                  { value: "2M+", label: "Lượt học" },
                  { value: "500+", label: "Hoạt động có hướng dẫn" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-3xl font-black tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <HeroPreview />
              <div
                className="winter-glass absolute -bottom-5 -left-4 hidden items-center gap-2 px-4 py-3 sm:flex"
                style={{ borderRadius: "1rem" }}
              >
                <Star className="h-4 w-4" style={{ color: "#ffb11a" }} />
                <span className="text-sm font-semibold text-foreground">
                  Phân cấp rõ, ít nhiễu thị giác
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* DESIGN SYSTEM */}
        <section id="how-it-works" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6">
          <div className="text-center">
            <span className="winter-pill">Cách hoạt động</span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Một hệ thống thiết kế cho mọi trang
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
              Tổng quan, từ điển, từ vựng, hồ sơ, quản trị và xưởng nội dung đều dùng chung nhịp
              khoảng cách, logic viền và bảng màu mùa đông dịu mắt.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlightCards.map((card, i) => (
              <motion.div
                key={card.title}
                className="winter-card h-full p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    color: "hsl(var(--w-accent-strong))",
                    background: "hsl(var(--w-accent) / 0.12)",
                  }}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* JLPT */}
        <section id="jlpt" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="winter-glass p-6 sm:p-8">
              <span className="winter-pill">Lộ trình JLPT</span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground">
                Các bước trực quan rõ ràng từ N5 đến N1
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                Giao diện nhóm bài học, tiến độ và gợi ý lại để bạn luôn biết cần làm gì tiếp theo ở
                cấp độ hiện tại.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Tổng quan làm nổi bật bài học kế tiếp và mục tiêu hôm nay.",
                  "Các trang khóa học dùng thẻ nhẹ, dễ lướt nhanh hơn.",
                  "Từ vựng, ngữ pháp, trắc nghiệm và Kanji theo cùng một phân cấp.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl p-3.5"
                    style={{ background: "hsl(var(--w-accent) / 0.06)" }}
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <p className="text-sm leading-7 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {levelCards.map((card, i) => (
                <motion.div
                  key={card.level}
                  className="winter-card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <div
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2.5"
                    style={{
                      color: "hsl(var(--w-accent-fg))",
                      background:
                        "linear-gradient(135deg, hsl(var(--w-accent)), hsl(var(--w-accent-strong)))",
                    }}
                  >
                    <span className="text-2xl font-black">{card.level}</span>
                  </div>
                  <p className="mt-4 text-lg font-bold text-foreground">{card.title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{card.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6">
          <div className="text-center">
            <span className="winter-pill">Hệ thống sản phẩm</span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Lấy cảm hứng từ các trung tâm điều khiển hiện đại
            </h2>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {featurePanels.map((panel, i) => (
              <motion.div
                key={panel.title}
                className="winter-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    color: "hsl(var(--w-accent-strong))",
                    background: "hsl(var(--w-accent) / 0.12)",
                  }}
                >
                  <panel.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">{panel.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{panel.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Prompt đã lưu", value: "150+" },
              { label: "Trợ lý AI", value: "12+" },
              { label: "Tài liệu đã tải lên", value: "89" },
              { label: "Luồng học", value: "1.2K" },
            ].map((metric) => (
              <div key={metric.label} className="winter-glass p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight text-foreground">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 winter-glass flex items-center gap-4 p-6">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{
                color: "hsl(var(--w-accent-strong))",
                background: "hsl(var(--w-accent) / 0.12)",
              }}
            >
              <MessageSquareText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tín hiệu cộng đồng
              </p>
              <p className="text-lg font-bold text-foreground">
                Trò chuyện, bảng tin và bảng xếp hạng nay gắn kết với nhau
              </p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6">
          <div className="text-center">
            <span className="winter-pill">Câu chuyện học viên</span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Điều học viên cảm nhận đầu tiên
            </h2>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.author}
                className="winter-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-1" style={{ color: "#ffb11a" }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-base leading-7 text-foreground">"{item.quote}"</p>
                <div className="mt-5">
                  <p className="font-bold text-foreground">{item.author}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6">
          <div
            className="relative overflow-hidden rounded-[1.8rem] px-6 py-12 text-center sm:px-10 sm:py-16"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--w-accent)) 0%, hsl(var(--w-accent-strong)) 100%)",
              boxShadow: "0 30px 70px -30px hsl(var(--w-accent) / 0.8)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 80% at 80% 0%, rgba(255,255,255,0.25), transparent 60%)",
              }}
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Sẵn sàng bắt đầu
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
                Một Yukihon tĩnh lặng và trong trẻo như tuyết đầu mùa.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">
                Hệ thống hình ảnh hướng quanh sự rõ ràng, phân cấp mạnh và những thẻ nhẹ nhàng dễ
                chịu cho mắt.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to={ctaLink}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-base font-bold text-[hsl(216_90%_40%)] transition-transform hover:-translate-y-0.5"
                >
                  {isAuthenticated ? "Đến trang tổng quan" : "Tạo tài khoản"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-white/20"
                >
                  Khám phá cấu trúc khóa học
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
