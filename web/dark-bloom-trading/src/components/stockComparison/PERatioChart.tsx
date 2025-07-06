import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface PERatioData {
  name: string;
  pe: number;
  fullName: string;
}

interface PERatioChartProps {
  data: PERatioData[];
}

const PERatioChart: React.FC<PERatioChartProps> = ({ data }) => {
  return (
    <Card className="bg-card hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.01] group">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 group-hover:text-purple-400 transition-colors duration-300">
          <BarChart3 className="h-5 w-5 text-purple-400 group-hover:animate-pulse" />
          <span>P/E Ratio Comparison</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
                formatter={(value: number) => [value.toFixed(1), 'P/E Ratio']}
              />
              <Bar dataKey="pe" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PERatioChart;
