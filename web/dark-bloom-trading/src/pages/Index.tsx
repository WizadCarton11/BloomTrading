
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlatformPreview from "@/components/PlatformPreview";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PlatformPreview />
      <StatsSection />
      <CTASection />
      
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 DarkBloom Trading. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
