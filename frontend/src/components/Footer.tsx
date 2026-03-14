import { Link } from "react-router-dom";
import { Github, Twitter, Instagram, Mail, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative py-20 overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 display-font italic">
                雪
              </div>
              <span className="text-xl font-extrabold tracking-tight">Yukihon</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Master Japanese in quiet, focused 15-minute sessions. Your personal journey to fluency starting from N5 to N1.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Learning</h3>
              <ul className="space-y-4">
                <li><Link to="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link></li>
                <li><Link to="/dictionary" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dictionary</Link></li>
                <li><Link to="/srs" className="text-sm text-muted-foreground hover:text-primary transition-colors">SRS Flashcards</Link></li>
                <li><Link to="/jlpt" className="text-sm text-muted-foreground hover:text-primary transition-colors">JLPT Paths</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Community</h3>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Story</Link></li>
                <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/affiliate" className="text-sm text-muted-foreground hover:text-primary transition-colors">Affiliate</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Legal</h3>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>English (US)</span>
            <span className="mx-2 opacity-30">|</span>
            <span>© 2025 Yukihon AI. All rights reserved.</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            Made with <span className="text-rose-500 animate-pulse">❤</span> in Japan
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
