
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ExternalLink, Zap } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
}

export function NewsSection3() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
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
        setHighlightedId(newNewsItem.id);
        
        setTimeout(() => setHighlightedId(null), 3000);
        
        const updatedNews = [newNewsItem, ...prevNews];
        return updatedNews.slice(0, 25);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getImpactBorder = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-500/50';
      case 'medium': return 'border-yellow-500/50';
      case 'low': return 'border-green-500/50';
      default: return 'border-gray-500/50';
    }
  };

  return (
    <section className="py-12 px-6 bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 bg-yellow-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Market Flash News - Style 3
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-pulse">
              Live Feed
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              {news.length} Updates
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-[600px] w-full rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-6">
          <div className="space-y-4">
            {news.map((item, index) => (
              <div
                key={item.id}
                className={`relative group ${
                  highlightedId === item.id ? 'animate-highlightPulse' : ''
                } ${index === 0 ? 'animate-slideInLeft' : ''}`}
              >
                <Card className={`relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl ${getImpactBorder(item.impact)} ${
                  highlightedId === item.id ? 'shadow-xl shadow-yellow-500/30 border-yellow-500/70' : 'border-slate-700/50'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-600/20 to-transparent rounded-full blur-2xl group-hover:from-slate-500/30 transition-all duration-500"></div>
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg font-bold leading-tight group-hover:text-slate-100 transition-colors duration-300">
                          {item.title}
                          {index === 0 && (
                            <Badge className={`ml-3 bg-gradient-to-r ${getImpactColor(item.impact)} text-white text-xs animate-bounce shadow-lg border-0`}>
                              LIVE
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-400">{item.timestamp}</span>
                          </div>
                          <Badge variant="outline" className="border-slate-600 text-slate-300 bg-slate-800/50">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getImpactColor(item.impact)} text-white text-xs font-bold uppercase shadow-lg`}>
                        {item.impact}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <p className="text-slate-300 mb-4 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        <span className="text-slate-400">Source:</span> <span className="text-yellow-400 font-medium">{item.source}</span>
                      </span>
                      <ExternalLink className="h-4 w-4 text-yellow-400 hover:text-yellow-300 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-100px) rotate(-5deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotate(0deg);
          }
        }
        
        @keyframes highlightPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 40px rgba(234, 179, 8, 0.5);
          }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.7s ease-out;
        }
        
        .animate-highlightPulse {
          animation: highlightPulse 2s ease-in-out;
        }
      `}</style>
    </section>
  );
}
