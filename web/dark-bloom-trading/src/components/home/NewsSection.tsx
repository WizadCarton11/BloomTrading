
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ExternalLink } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
}

export function NewsSection() {
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
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Market Flash News - Style 1</h2>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-400 text-emerald-400">
              Live Updates
            </Badge>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              {news.length} Stories
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-[600px] w-full rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <div className="space-y-4">
            {news.map((item, index) => (
              <Card 
                key={item.id} 
                className={`bg-gray-800 border-gray-700 hover:border-emerald-500 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/20 transform hover:scale-[1.02] ${
                  index === 0 ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20 animate-pulse' : ''
                }`}
                style={{
                  animation: index === 0 ? 'slideInFromTop 0.8s ease-out' : undefined
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-white text-lg font-semibold leading-tight">
                      {item.title}
                      {index === 0 && (
                        <Badge className="ml-2 bg-emerald-600 text-white text-xs animate-bounce">
                          NEW
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge className={`${getImpactColor(item.impact)} text-white capitalize shrink-0`}>
                      {item.impact}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </div>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Source: {item.source}</span>
                    <ExternalLink className="h-4 w-4 text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <style jsx>{`
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
