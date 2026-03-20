import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import kaorukoGuide from "@/assets/kaoruko-guide.png";

const CTASection = () => (
  <section className="py-24 md:py-32 relative overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        className="relative rounded-[3.5rem] overflow-hidden border border-white/10 bg-[#0a0f1a]/80 backdrop-blur-3xl p-10 md:p-16 lg:p-24 text-center shadow-2xl shadow-primary/5"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-60" />
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen" />

          <svg className="absolute top-10 right-10 w-64 h-64 text-white/[0.03] rotate-12" viewBox="0 0 200 200" fill="currentColor">
            <path d="M160,100c0-22.1-17.9-40-40-40c-5.7,0-11,1.2-15.8,3.3C96.2,51.1,84.1,44,70,44c-24.3,0-44,19.7-44,44c0,2.1,0.2,4.2,0.5,6.2C11.5,99.4,0,113.3,0,130c0,22.1,17.9,40,40,40h120c22.1,0,40-17.9,40-40C200,107.9,182.1,90,160,100z" />
          </svg>
          <svg className="absolute -bottom-10 -left-20 w-96 h-96 text-white/[0.02]" viewBox="0 0 200 200" fill="currentColor">
            <path d="M160,100c0-22.1-17.9-40-40-40c-5.7,0-11,1.2-15.8,3.3C96.2,51.1,84.1,44,70,44c-24.3,0-44,19.7-44,44c0,2.1,0.2,4.2,0.5,6.2C11.5,99.4,0,113.3,0,130c0,22.1,17.9,40,40,40h120c22.1,0,40-17.9,40-40C200,107.9,182.1,90,160,100z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="mb-10 relative group">
            <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <img
              src={kaorukoGuide}
              alt="Kaoruko"
              className="relative w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-[3px] border-white/20 shadow-2xl mx-auto group-hover:scale-105 transition-transform duration-500"
            />
            
            <motion.div
              className="absolute -right-6 -bottom-2 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-2xl rounded-bl-none shadow-xl text-sm md:text-base border border-white/10"
              animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Join our family! ✨
            </motion.div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight display-font">
            Ready to master <span className="italic text-primary">Japanese</span>?
          </h2>
          
          <p className="text-lg md:text-2xl text-white/70 mb-12 font-medium max-w-2xl leading-relaxed">
            Experience a peaceful, effective journey to fluency with Kaoruko. No stress, just magical progress.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
            <Link to="/auth">
              <Button
                size="lg"
                className="h-16 px-10 text-xl learnhub-edge learnhub-shadow bg-primary text-primary-foreground hover:scale-105 transition-all overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start free trial
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-colors">
                Explore courses
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
