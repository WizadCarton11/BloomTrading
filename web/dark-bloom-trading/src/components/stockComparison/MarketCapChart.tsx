import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

interface MarketCapData {
  name: string;
  value: number;
  fullName: string;
}

interface MarketCapChartProps {
  data: MarketCapData[];
}

const MarketCapChart: React.FC<MarketCapChartProps> = ({ data }) => {
  return (
    <Card className="bg-card hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-[1.01] group">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 group-hover:text-green-400 transition-colors duration-300">
          <DollarSign className="h-5 w-5 text-green-400 group-hover:animate-bounce" />
          <span>Market Capitalization Comparison</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
                formatter={(value: number) => [`$${value.toFixed(0)}B`, 'Market Cap']}
              />
              <Bar dataKey="value" fill="url(#greenGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketCapChart;
