
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HeroSection } from "@/components/home/HeroSection";
import { MarketSnapshot } from "@/components/home/MarketSnapshot";
import { PortfolioOverview } from "@/components/home/PortfolioOverview";
import { NewsSection } from "@/components/home/NewsSection";
import { NewsSection2 } from "@/components/home/NewsSection2";
import { NewsSection3 } from "@/components/home/NewsSection3";
import { AppSidebar } from "@/components/home/AppSidebar";

const Home = () => {
  return (
    <SidebarProvider>
    <div className="min-h-screen flex w-full bg-gray-950">
            <AppSidebar />
            <main className="flex-1">
    <div className="min-h-screen bg-gray-950">
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-emerald-400 hover:text-emerald-300 hover:bg-gray-800" />
          <h1 className="text-xl font-semibold text-white">Trading Dashboard</h1>
        </div>
      </div>
      
      <HeroSection />
      <MarketSnapshot />
      <PortfolioOverview />
      <NewsSection />
      <NewsSection2 />
      <NewsSection3 />
    </div>
    </main>
    </div>
    </SidebarProvider>
  );
};

export default Home;
