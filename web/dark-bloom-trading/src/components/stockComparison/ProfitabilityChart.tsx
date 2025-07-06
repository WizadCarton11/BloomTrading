import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfitabilityData {
  name: string;
  profitMargin: number;
  operatingMargin: number;
  roe: number;
}

interface ProfitabilityChartProps {
  data: ProfitabilityData[];
}

const ProfitabilityChart: React.FC<ProfitabilityChartProps> = ({ data }) => {
  return (
    <Card className="bg-card hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-[1.005] group">
      <CardHeader>
        <CardTitle className="group-hover:text-green-400 transition-colors duration-300">
          Profitability Metrics Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              />
              <Bar dataKey="profitMargin" fill="#10B981" name="Profit Margin" radius={[2, 2, 0, 0]} />
              <Bar dataKey="operatingMargin" fill="#3B82F6" name="Operating Margin" radius={[2, 2, 0, 0]} />
              <Bar dataKey="roe" fill="#8B5CF6" name="Return on Equity" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityChart;
