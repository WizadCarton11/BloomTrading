import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarData {
  stock: string;
  [key: string]: string | number;
}

interface Stock {
  symbol: string;
  [key: string]: any;
}

interface RadarAnalysisChartProps {
  radarData: RadarData[];
  selectedStocks: Stock[];
}

const RadarAnalysisChart: React.FC<RadarAnalysisChartProps> = ({ radarData, selectedStocks }) => {
  const chartData = radarData[0] ? Object.keys(radarData[0]).filter(key => key !== 'stock').map(key => ({
    metric: key,
    ...radarData.reduce((acc, stock) => ({ ...acc, [stock.stock]: stock[key as keyof typeof stock] }), {})
  })) : [];

  return (
    <Card className="bg-card hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group">
      <CardHeader>
        <CardTitle className="group-hover:text-blue-400 transition-colors duration-300">
          Multi-Dimensional Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <ResponsiveContainer width="100%" height={800}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              {selectedStocks.map((stock, index) => (
                <Radar
                  key={stock.symbol}
                  name={stock.symbol}
                  dataKey={stock.symbol}
                  stroke={['#3B82F6', '#8B5CF6', '#10B981'][index]}
                  fill={['#3B82F6', '#8B5CF6', '#10B981'][index]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RadarAnalysisChart;
