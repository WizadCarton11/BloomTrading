
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ExternalLink, TrendingUp } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
}

export function NewsSection2() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const newsIdCounter = useRef(1);

  const generateRandomNews = (): NewsItem => {
    const titles = [
      'Federal Reserve Announces Interest Rate Decision',
      'Tech Giants Report Quarterly Earnings Beat',
      'Oil Prices Surge on Supply Chain Disruptions',
      'Cryptocurrency Market Shows Strong Recovery',
      'New Trade Agreement Boosts Manufacturing Stocks',
      'Banking Sector Faces Regulatory Challenges',
      'AI Stocks Rally After Major Breakthrough',
      'Global Markets React to Economic Data',
      'Renewable Energy Sector Attracts Investment',
      'Pharmaceutical Companies Announce Merger',
      'Retail Sales Data Exceeds Expectations',
      'Central Bank Policy Impacts Currency Markets',
      'Infrastructure Bill Passes Senate Vote',
      'Supply Chain Issues Affect Auto Industry',
      'Technology Sector Leads Market Gains',
      'Energy Prices Fluctuate on Weather Concerns',
      'Housing Market Shows Signs of Recovery',
      'International Trade Tensions Escalate',
      'Consumer Confidence Index Rises',
      'Labor Market Data Shows Growth'
    ];

    const summaries = [
      'The Fed maintains current rates while signaling potential changes in upcoming meetings...',
      'Major technology companies exceed analyst expectations for Q4 revenue and profit margins...',
      'Crude oil futures climb 3% as geopolitical tensions affect major shipping routes...',
      'Bitcoin and Ethereum lead digital asset rally as institutional adoption increases...',
      'Industrial sector gains momentum following announcement of bilateral trade partnership...',
      'New regulations create uncertainty for major banking institutions across the sector...',
      'Artificial intelligence companies see massive gains following breakthrough announcement...',
      'International markets respond positively to better-than-expected economic indicators...',
      'Clean energy investments surge as government incentives drive sector growth...',
      'Major pharmaceutical merger expected to create industry-leading research capabilities...',
      'Consumer spending data shows robust growth across multiple retail categories...',
      'Currency markets experience volatility following central bank policy announcement...',
      'Multi-billion dollar infrastructure package receives bipartisan support in Congress...',
      'Automotive manufacturers struggle with ongoing supply chain and chip shortages...',
      'Technology stocks drive broader market rally with strong earnings reports...',
      'Weather patterns and seasonal demand create volatility in energy commodity prices...',
      'Real estate market indicators suggest stabilization after recent volatility period...',
      'Escalating trade disputes create uncertainty for international business operations...',
      'Consumer sentiment reaches highest levels in months according to latest survey...',
      'Employment statistics show continued job growth across multiple economic sectors...'
    ];

    const categories = ['Federal Reserve', 'Earnings', 'Commodities', 'Crypto', 'Trade', 'Banking', 'AI/Tech', 'Economy', 'Energy', 'Healthcare'];
    const impacts: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const sources = ['Reuters', 'Bloomberg', 'MarketWatch', 'CoinDesk', 'Financial Times', 'WSJ', 'CNBC', 'Yahoo Finance'];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];

    return {
      id: `news-${newsIdCounter.current++}`,
      title: randomTitle,
      summary: randomSummary,
      category: categories[Math.floor(Math.random() * categories.length)],
      timestamp: `${Math.floor(Math.random() * 60)} seconds ago`,
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      source: sources[Math.floor(Math.random() * sources.length)]
    };
  };

  useEffect(() => {
    const initialNews = Array.from({ length: 25 }, () => generateRandomNews());
    setNews(initialNews);

    const interval = setInterval(() => {
      setNews(prevNews => {
        const newNewsItem = generateRandomNews();
        const updatedNews = [newNewsItem, ...prevNews];
        return updatedNews.slice(0, 25);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/90 border-red-400';
      case 'medium': return 'bg-yellow-500/90 border-yellow-400';
      case 'low': return 'bg-green-500/90 border-green-400';
      default: return 'bg-gray-500/90 border-gray-400';
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white">Market Flash News - Style 2</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-cyan-400 text-cyan-400 animate-pulse">
              Live Updates
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              {news.length} Stories
            </Badge>
          </div>
        </div>
        
        <div className="relative">
          <ScrollArea className="h-[600px] w-full rounded-xl border border-gray-700/50 bg-gradient-to-b from-gray-800/60 to-gray-900/60 backdrop-blur-sm p-6">
            <div className="space-y-6">
              {news.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-xl transition-all duration-700 ${
                    index === 0 ? 'animate-fadeInScale' : ''
                  }`}
                >
                  <Card className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/50 backdrop-blur-sm hover:from-gray-700/90 hover:to-gray-600/90 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></div>
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-white text-xl font-bold leading-tight group-hover:text-cyan-100 transition-colors duration-300">
                            {item.title}
                            {index === 0 && (
                              <Badge className="ml-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs animate-pulse shadow-lg">
                                BREAKING
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-cyan-400" />
                              <span className="text-cyan-300">{item.timestamp}</span>
                            </div>
                            <Badge variant="secondary" className="bg-gray-700/80 text-gray-300 border border-gray-600">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-white text-sm font-medium border ${getImpactColor(item.impact)} shadow-lg`}>
                          {item.impact.toUpperCase()}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-300 mb-4 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                          Source: <span className="text-cyan-400 font-medium">{item.source}</span>
                        </span>
                        <ExternalLink className="h-5 w-5 text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all duration-300 hover:scale-110" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.8s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out;
        }
      `}</style>
    </section>
  );
}
