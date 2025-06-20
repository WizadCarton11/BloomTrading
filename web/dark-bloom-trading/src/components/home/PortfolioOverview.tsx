
import { PortfolioStats } from "@/components/home/portfolio/PortfolioStats";
import { PortfolioAllocationChart } from "@/components/home/portfolio/PortfolioAllocationChart";
import { HoldingsDetails } from "@/components/home/portfolio/HoldingsDetails";

export function PortfolioOverview() {
  const portfolioData = {
    totalValue: 125847.32,
    dayChange: 2847.65,
    dayChangePercent: 2.31,
    totalGain: 15847.32,
    totalGainPercent: 14.4,
    holdings: [
      { symbol: "AAPL", value: 45000, allocation: 35.8, gain: 8.5 },
      { symbol: "GOOGL", value: 32000, allocation: 25.4, gain: 12.3 },
      { symbol: "MSFT", value: 28000, allocation: 22.3, gain: 6.7 },
      { symbol: "TSLA", value: 15000, allocation: 11.9, gain: -3.2 },
      { symbol: "Others", value: 5847.32, allocation: 4.6, gain: 15.1 }
    ]
  };

  return (
    <section className="py-12 px-6 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Portfolio Overview</h2>
        
        <PortfolioStats portfolioData={portfolioData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioAllocationChart holdings={portfolioData.holdings} />
          <HoldingsDetails holdings={portfolioData.holdings} />
        </div>
      </div>
    </section>
  );
}
