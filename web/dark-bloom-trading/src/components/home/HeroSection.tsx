
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

const dynamicTexts = [
  "Trade Smarter with AI-Powered Insights",
  "Maximize Your Portfolio Performance",
  "Real-time Market Analysis at Your Fingertips",
  "Professional Trading Tools for Everyone",
  "Turn Market Volatility into Opportunity"
];

export function HeroSection() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % dynamicTexts.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
             <span className="animate-gradient bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 transition-all duration-1050 bg-clip-text text-transparent bg-300% font-extrabold">DarkBloom Trading</span>
          </h1>
          <div className="h-16 flex items-center justify-center">
            <p 
              className={`text-xl md:text-2xl text-gray-300 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {dynamicTexts[currentTextIndex]}
            </p>
          </div>
        </div>
        
        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
            Start Tradingaaa
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-gray-900 px-8 py-3 text-lg">
            Learn More
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold text-emerald-400 mb-2">Real-time Data</h3>
            <p className="text-gray-300">Get instant market updates and live price feeds</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold text-blue-400 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-300">Smart insights powered by advanced algorithms</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold text-purple-400 mb-2">Secure Trading</h3>
            <p className="text-gray-300">Bank-level security for your investments</p>
          </div>
        </div>
      </div>
    </section>
  );
}
