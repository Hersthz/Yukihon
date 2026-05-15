import { Link } from "react-router-dom";
import { Github, Instagram, Mail, Twitter } from "lucide-react";

const footerColumns = [
  {
    title: "Learning",
    links: [
      { label: "Courses", to: "/courses" },
      { label: "Vocabulary", to: "/vocabulary" },
      { label: "Dictionary", to: "/dictionary" },
      { label: "JLPT Paths", to: "/jlpt-lessons" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "AI Chat", to: "/ai-chat" },
      { label: "Story Mode", to: "/story-mode" },
      { label: "Community", to: "/community" },
      { label: "My Words", to: "/my-words" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Profile", to: "/profile" },
      { label: "Calendar", to: "/calendar" },
      { label: "Translation", to: "/translation" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative pb-10 pt-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="surface-panel overflow-hidden bg-white/92 px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[#ffcfc6]">
                  <span className="display-font text-3xl font-bold text-foreground">Y</span>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight text-foreground">Yukihon</p>
                  <p className="text-sm text-muted-foreground">A light-first Japanese learning workspace.</p>
                </div>
              </div>

              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
                Built around quick sessions, strong visual hierarchy, and calm study momentum. The whole product now
                follows one warm, clean light theme from landing to dashboard.
              </p>

              <div className="mt-6 flex items-center gap-3">
                {[Twitter, Instagram, Github, Mail].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-border/80 bg-white text-muted-foreground transition hover:-translate-y-1 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-foreground">{column.title}</p>
                  <div className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border/80 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Palette: cream canvas, navy outline, mint CTA, sky + peach accents.</p>
            <p>© 2026 Yukihon. Designed for a lighter learning flow.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
