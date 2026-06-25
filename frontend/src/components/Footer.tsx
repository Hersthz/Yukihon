import { Link } from "react-router-dom";
import { Github, Instagram, Mail, Twitter } from "lucide-react";
import { WinterMark } from "@/components/winter";

const footerColumns = [
  {
    title: "Học tập",
    links: [
      { label: "Khóa học", to: "/courses" },
      { label: "Từ vựng", to: "/vocabulary" },
      { label: "Từ điển", to: "/dictionary" },
      { label: "Lộ trình JLPT", to: "/jlpt-lessons" },
    ],
  },
  {
    title: "Sản phẩm",
    links: [
      { label: "Trợ lý AI", to: "/ai-chat" },
      { label: "Học qua truyện", to: "/story-mode" },
      { label: "Cộng đồng", to: "/community" },
      { label: "Sổ từ của tôi", to: "/my-words" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Hồ sơ", to: "/profile" },
      { label: "Lịch học", to: "/calendar" },
      { label: "Dịch thuật", to: "/translation" },
      { label: "Cài đặt", to: "/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative pb-10 pt-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="winter-glass overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    color: "hsl(var(--w-accent-fg))",
                    background:
                      "linear-gradient(135deg, hsl(var(--w-accent)), hsl(var(--w-accent-strong)))",
                    boxShadow: "0 8px 20px -10px hsl(var(--w-accent) / 0.8)",
                  }}
                >
                  <WinterMark size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight text-foreground">Yukihon</p>
                  <p className="text-sm text-muted-foreground">
                    Không gian học tiếng Nhật tĩnh lặng như tuyết.
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
                Xây quanh những buổi học ngắn, phân cấp thị giác mạnh và nhịp học bền bỉ. Toàn bộ
                sản phẩm theo một ngôn ngữ thiết kế nhất quán từ trang chủ đến tổng quan.
              </p>

              <div className="mt-6 flex items-center gap-3">
                {[Twitter, Instagram, Github, Mail].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform hover:-translate-y-1"
                    style={{
                      color: "hsl(var(--w-ink-soft))",
                      background: "hsl(var(--w-card))",
                      border: "1px solid hsl(var(--w-glass-border))",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-foreground">
                    {column.title}
                  </p>
                  <div className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-10 flex flex-col gap-3 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
            style={{ borderTop: "1px solid hsl(var(--w-border))" }}
          >
            <p>Bảng màu: trời tuyết, xanh băng, kính mờ và viền mảnh.</p>
            <p>© 2026 Yukihon. Thiết kế cho một luồng học nhẹ nhàng.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
