import { Link } from "react-router-dom";
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
  Users,
} from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import kaorukoHappy from "@/assets/kaoruko-happy.png";

const highlightCards = [
  {
    icon: Clock3,
    title: "Học theo nhịp độ của bạn",
    description:
      "Bài học ngắn, ôn nhanh và giao diện nhẹ nhàng giúp mỗi buổi học thoải mái thay vì quá tải.",
    color: "bg-[#ffd5cd]",
  },
  {
    icon: Brain,
    title: "Vòng ôn tập thông minh",
    description:
      "Từ điển, từ vựng, bài kiểm tra và Mistake DNA gắn kết thành một luồng học duy nhất.",
    color: "bg-[#d9f1ff]",
  },
  {
    icon: GraduationCap,
    title: "Bám sát JLPT",
    description:
      "Mọi phần của ứng dụng nay đều hỗ trợ lộ trình rõ ràng từ nền tảng N5 đến các cấp độ cao hơn.",
    color: "bg-[#e6dcff]",
  },
  {
    icon: Users,
    title: "Hỗ trợ cộng đồng",
    description:
      "Học cùng nhau, hỏi đáp nhanh và giữ lớp tương tác xã hội luôn hiển thị mà không rối mắt.",
    color: "bg-[#d7ffd9]",
  },
];

const levelCards = [
  {
    level: "N5",
    title: "Nền tảng",
    detail: "Kana, từ vựng cốt lõi, mẫu câu thiết yếu",
    color: "bg-[#d8ffe0]",
  },
  {
    level: "N4",
    title: "Tiếng Nhật hằng ngày",
    detail: "Hội thoại thường ngày và dựng câu",
    color: "bg-[#dff3ff]",
  },
  {
    level: "N3",
    title: "Mạch trung cấp",
    detail: "Đọc, nghe tự nhiên hơn và nắm sắc thái",
    color: "bg-[#fff2c8]",
  },
  {
    level: "N2",
    title: "Chiều sâu chuyên môn",
    detail: "Cấu trúc phức tạp và tiếng Nhật sẵn sàng cho công việc",
    color: "bg-[#ffe0d2]",
  },
  {
    level: "N1",
    title: "Thành thạo",
    detail: "Đọc nâng cao, chính xác và diễn đạt tinh tế",
    color: "bg-[#eadfff]",
  },
];

const featurePanels = [
  {
    title: "Từ điển và Từ của tôi đi cùng nhau",
    description:
      "Thiết kế mới khiến việc lưu, ôn lại và quay về với từ vựng trở thành một thao tác liền mạch thay vì phải chuyển ngữ cảnh.",
    icon: BookOpen,
    tone: "bg-[#f0fbff]",
  },
  {
    title: "Tổng quan trở thành trung tâm điều khiển",
    description:
      "Thống kê nhanh, bài học kế tiếp, tín hiệu học tập và lối tắt được hiển thị trong một trang tổng quan sáng, phân cấp rõ ràng.",
    icon: Target,
    tone: "bg-[#f5fff2]",
  },
  {
    title: "AI và dịch thuật cùng một ngôn ngữ thiết kế",
    description:
      "Trợ lý, không gian dịch và phần ngữ pháp nay dùng chung logic hiển thị, khoảng cách và bảng màu sáng.",
    icon: Languages,
    tone: "bg-[#fff8ef]",
  },
];

const testimonials = [
  {
    quote: "Bố cục mới nhẹ nhàng, nhanh hơn và dễ lướt hơn nhiều khi mình chỉ có 15 phút để học.",
    author: "Mai Anh",
    role: "Học viên JLPT N4",
  },
  {
    quote:
      "Mình có thể nhảy từ từ điển sang từ đã lưu rồi sang ôn bài kiểm tra mà không thấy như đang vào một sản phẩm khác.",
    author: "Khanh Linh",
    role: "Người tự học",
  },
  {
    quote: "Trang tổng quan giờ thực sự như một buồng lái học tập thay vì một mớ tiện ích rời rạc.",
    author: "Tuan Hoang",
    role: "Người duy trì chuỗi học mỗi ngày",
  },
];

const Index = () => {
  const { isAuthenticated } = useAuth();
  const ctaLink = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Navigation />

      <main className="relative pb-12 pt-28 sm:pt-32 lg:pt-36">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(255,210,201,0.5),transparent_36%),radial-gradient(circle_at_top_right,rgba(191,238,254,0.58),transparent_32%)]" />

        <section id="hero" className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="section-kicker mb-5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Trải nghiệm học ưu tiên giao diện sáng mới
              </div>

              <h1 className="display-font max-w-3xl text-[3.4rem] leading-[0.95] text-foreground sm:text-[4.6rem] lg:text-[6.2rem]">
                Học tiếng Nhật,
                <br />
                <span className="text-primary">Mọi lúc,</span>
                <br />
                Mọi nơi.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Yukihon nay được thiết kế lại quanh một giao diện sáng ấm áp, rõ ràng hơn, lấy cảm
                hứng từ các bố cục giáo dục nổi bật và những trang tổng quan năng suất hiện đại. Mọi
                trang quan trọng giờ đều tuân theo một ngôn ngữ thiết kế chung.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to={ctaLink}>
                  <Button className="min-w-[210px] text-base">
                    {isAuthenticated ? "Mở trang tổng quan" : "Bắt đầu học miễn phí"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    className="min-w-[210px] bg-secondary text-secondary-foreground hover:bg-secondary"
                    variant="secondary"
                  >
                    Khám phá lộ trình khóa học
                  </Button>
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-8">
                {[
                  { value: "10K+", label: "Từ vựng và bài học" },
                  { value: "2M+", label: "Lượt học" },
                  { value: "500+", label: "Hoạt động có hướng dẫn" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-4xl font-black tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="surface-panel relative overflow-hidden bg-white/96 p-5 sm:p-6">
                <div className="absolute right-5 top-5 rounded-[1.4rem] bg-[#ffd3cb] p-4">
                  <Target className="h-8 w-8 text-foreground" />
                </div>

                <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[1.7rem] bg-[#eef9ff] p-5">
                    <img
                      src={kaorukoHappy}
                      alt="Kaoruko"
                      className="mx-auto h-56 object-contain sm:h-64"
                    />
                    <div className="mt-3 rounded-[1.2rem] bg-white/90 p-4">
                      <p className="text-sm font-semibold text-foreground">Kaoruko đã sẵn sàng</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Từ điển, luồng luyện tập và gợi ý AI của bạn nay đều dùng chung một giao
                        diện sáng.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-border bg-[#f8fbf7] p-5">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Trọng tâm hiện tại
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[#d9eff9]">
                          <BookOpen className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">Tổng quan kiểu web</p>
                          <p className="text-sm text-muted-foreground">
                            12 khối, 4h 30m luồng học tương tác
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-semibold text-primary">65%</span>
                        </div>
                        <div className="h-3 rounded-full bg-white">
                          <div className="h-full w-[65%] rounded-full bg-primary" />
                        </div>
                      </div>

                      <Button className="mt-5 w-full">Tiếp tục học</Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-border bg-[#fff5ec] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Hệ thống thiết kế
                        </p>
                        <p className="mt-3 text-lg font-semibold text-foreground">
                          Kem, bạc hà, đào, xanh trời
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-border bg-[#f4f0ff] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Giao diện tổng quan
                        </p>
                        <p className="mt-3 text-lg font-semibold text-foreground">
                          Không gian quản trị và sáng tạo gọn gàng hơn
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 rounded-[1.3rem] bg-[#dff8de] px-4 py-3 shadow-[0_18px_36px_-22px_rgba(32,48,74,0.24)]">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#ffb11a]" />
                  <span className="text-sm font-semibold text-foreground">
                    Phân cấp tốt hơn, ít nhiễu thị giác hơn
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="surface-panel-soft px-6 py-8 sm:px-8">
            <div className="text-center">
              <span className="section-kicker">Cách hoạt động</span>
              <h2 className="section-title mt-6">Một hệ thống thiết kế cho mọi trang</h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
                Việc thiết kế lại không dừng ở trang chủ. Tổng quan, từ điển, từ vựng, hồ sơ, quản
                trị và xưởng nội dung nay đều dùng chung nhịp khoảng cách, logic viền và bảng màu
                pastel nhấn.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {highlightCards.map((card) => (
                <div key={card.title} className="surface-panel-soft h-full p-5">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-[1.3rem] ${card.color}`}
                  >
                    <card.icon className="h-7 w-7 text-foreground" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-foreground">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="jlpt" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="surface-panel-soft p-6 sm:p-8">
              <span className="section-kicker">Lộ trình JLPT</span>
              <h2 className="section-title mt-6">Các bước trực quan rõ ràng từ N5 đến N1</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                Giao diện mới nhóm bài học, tiến độ và gợi ý lại để người dùng luôn biết cần làm gì
                tiếp theo ở cấp độ hiện tại.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Trang tổng quan làm nổi bật bài học kế tiếp và mục tiêu hôm nay.",
                  "Các trang khóa học dùng thẻ nhẹ hơn, dễ lướt nhanh hơn.",
                  "Từ vựng, ngữ pháp, bài kiểm tra và Kanji theo cùng một phân cấp.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1.2rem] bg-white/88 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <p className="text-sm leading-7 text-foreground/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {levelCards.map((card) => (
                <div key={card.level} className="surface-panel-soft p-5">
                  <div className={`inline-flex rounded-[1rem] px-4 py-3 ${card.color}`}>
                    <span className="display-font text-3xl font-bold text-foreground">
                      {card.level}
                    </span>
                  </div>
                  <p className="mt-5 text-xl font-bold text-foreground">{card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="surface-panel overflow-hidden p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="section-kicker">Hệ thống sản phẩm</span>
                  <h2 className="section-title mt-6">
                    Tổng quan lấy cảm hứng từ các trung tâm điều khiển hiện đại
                  </h2>
                </div>
                <Badge className="rounded-full border border-primary/20 bg-[#eef9ee] px-4 py-2 text-primary hover:bg-[#eef9ee]">
                  Chỉ giao diện sáng
                </Badge>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Prompt đã lưu", value: "150+" },
                  { label: "Trợ lý AI", value: "12+" },
                  { label: "Tài liệu đã tải lên", value: "89" },
                  { label: "Luồng học", value: "1.2K" },
                ].map((metric, index) => (
                  <div
                    key={metric.label}
                    className={
                      ["bg-[#e8f0ff]", "bg-[#eef8dd]", "bg-[#fff3b8]", "bg-[#ece4ff]"][index] +
                      " rounded-[1.5rem] p-5"
                    }
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-4 text-4xl font-black tracking-tight text-foreground">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.7rem] border border-border bg-[#fbfcff] p-5">
                  <p className="text-lg font-semibold text-foreground">Khởi chạy nhanh trợ lý</p>
                  <div className="mt-4 rounded-[1.4rem] border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Trợ lý trả lời email thông minh
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Hệ thống thẻ nhẹ nhàng hơn giúp các luồng quản trị và sáng tạo dày đặc dễ lướt
                      hơn.
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.7rem] border border-border bg-[#fcfff7] p-5">
                  <p className="text-lg font-semibold text-foreground">Hoạt động gần đây</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1.3rem] bg-[#e7efff] p-4">
                      <p className="font-semibold text-foreground">Xu hướng Marketing 2025</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Thẻ dễ đọc, tab rõ ràng và khoảng cách nhẹ hơn.
                      </p>
                    </div>
                    <div className="rounded-[1.3rem] bg-[#e8f7df] p-4">
                      <p className="font-semibold text-foreground">Hàng chờ ôn từ vựng</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Trạng thái và thao tác nay nhất quán về mặt hình ảnh.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {featurePanels.map((panel) => (
                <div key={panel.title} className={`surface-panel-soft p-6 ${panel.tone}`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white">
                    <panel.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-foreground">{panel.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {panel.description}
                  </p>
                </div>
              ))}

              <div className="surface-panel-soft bg-[#fff7eb] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white">
                    <MessageSquareText className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Tín hiệu cộng đồng
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      Trò chuyện, bảng tin và bảng xếp hạng nay gắn kết với nhau
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="text-center">
            <span className="section-kicker">Câu chuyện học viên</span>
            <h2 className="section-title mt-6">Điều học viên cảm nhận đầu tiên</h2>
          </div>

          <div className="mt-10 grid gap-4 xl:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.author} className="surface-panel-soft p-6">
                <div className="flex items-center gap-1 text-[#ffb11a]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-lg leading-8 text-foreground/85">"{item.quote}"</p>
                <div className="mt-6">
                  <p className="font-semibold text-foreground">{item.author}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="surface-panel overflow-hidden bg-[linear-gradient(135deg,#20324f_0%,#2c4165_100%)] px-6 py-10 text-white sm:px-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Sẵn sàng ra mắt thiết kế mới
                </span>
                <h2 className="display-font mt-6 text-[3rem] leading-none sm:text-[4rem]">
                  Một Yukihon nhẹ nhàng và tươi sáng hơn.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
                  Hệ thống hình ảnh nay hướng quanh chế độ sáng, phân cấp thông tin mạnh mẽ và những
                  thẻ vui mắt lấy cảm hứng từ các tham chiếu bạn thích.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to={ctaLink}>
                  <Button className="bg-white text-foreground hover:bg-white/92">
                    {isAuthenticated ? "Đến trang tổng quan" : "Tạo tài khoản"}
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    className="border-white/25 bg-white/10 text-white hover:bg-white/16"
                    variant="outline"
                  >
                    Khám phá cấu trúc khóa học
                  </Button>
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
