import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users } from 'lucide-react';

interface AnalystRating {
  name: string;
  value: number;
  color: string;
}

interface Stock {
  symbol: string;
}

interface AnalystRatingsCardProps {
  stock: Stock;
  ratingsData: AnalystRating[];
}

const AnalystRatingsCard: React.FC<AnalystRatingsCardProps> = ({ stock, ratingsData }) => {
  return (
    <Card className="bg-card hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 group">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 group-hover:text-blue-400 transition-colors duration-300">
          <Users className="h-5 w-5 text-blue-400 group-hover:animate-pulse" />
          <span>{stock.symbol} Analyst Ratings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ratingsData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {ratingsData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  color: '#000000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalystRatingsCard;
