import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WinterNightBackground from "@/components/WinterNightBackground";
import HeroSection from "@/components/landing/HeroSection";
import CourseCatalogSection from "@/components/landing/CourseCatalogSection";
import ProgressTrackingSection from "@/components/landing/ProgressTrackingSection";
import JLPTLevelsSection from "@/components/landing/JLPTLevelsSection";
import FeaturesBentoSection from "@/components/landing/FeaturesBentoSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => (
  <div className="min-h-screen bg-background overflow-hidden relative">
    <Navigation />
    <WinterNightBackground snowCount={40} sparkleCount={20} intensity="light" />

    <HeroSection />
    <CourseCatalogSection />
    <ProgressTrackingSection />
    <JLPTLevelsSection />
    <FeaturesBentoSection />
    <TestimonialsSection />
    <CTASection />

    <Footer />
  </div>
);

export default Index;
