// import Navigation from "@/components/index/Navigation";
// import HeroSection from "@/components/index/HeroSection";
// import FeaturesSection from "@/components/index/FeaturesSection";
// import PlatformPreview from "@/components/index/PlatformPreview";
// import StatsSection from "@/components/index/StatsSection";
// import CTASection from "@/components/index/CTASection";
// import AiSection from "@/components/index/AiSection";
import { Suspense, useEffect } from "react";
import React from "react";
const Navigation = React.lazy(() => import("@/components/index/Navigation"));
const HeroSection = React.lazy(() => import("@/components/index/HeroSection"));
const FeaturesSection = React.lazy(() => import("@/components/index/FeaturesSection"));
const PlatformPreview = React.lazy(() => import("@/components/index/PlatformPreview"));
const StatsSection = React.lazy(() => import("@/components/index/StatsSection"));
const CTASection = React.lazy(() => import("@/components/index/CTASection"));
const AiSection = React.lazy(() => import("@/components/index/AiSection"));
const Index = () => {
  // Apply custom scrollbar styling when component mounts
  useEffect(() => {
    // Add custom scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      ::-webkit-scrollbar {
        width: 10px;
        background-color: #111827; /* dark background */
      }
      
      ::-webkit-scrollbar-thumb {
        background-color: #6366F1; /* indigo color, assuming your theme */
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background-color: #4F46E5; /* darker on hover */
      }
      
      /* For Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: #6366F1 #111827;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<div className="flex items-center justify-center align-middle h-screen">Loading...</div>}>
        <Navigation />
        <HeroSection />
        <FeaturesSection />
        <PlatformPreview />
        <AiSection />
        <StatsSection />
        <CTASection />
      </Suspense>
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 DarkBloom Trading. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;