import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useMemo, useEffect, useRef, useState } from 'react';
import { generateColorPalette } from '@/utils/GetColors';

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#e2e8f0"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
    >
      {/* {`${(percent * 1).toFixed(1)}%`} */}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-slate-900 text-slate-100 rounded-full px-3 py-1 shadow-md border border-slate-600 text-sm">
        <strong>{name}</strong>: ${(value).toFixed(1)} ({(value / 100).toFixed(1)}%)
      </div>
    );
  }
  return null;
};

const AssetAllocationChart = ({ portfolio }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const chartRef = useRef(null);
  const COLORS = generateColorPalette(portfolio.length);
const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => {
    const allocation = portfolio.map((stock) => ({
      name: stock.symbol,
      value: stock.quantity * stock.averageCost,
    }));

    const total = allocation.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) return [];

    return allocation.map((item) => ({
      ...item,
      percent: ((item.value / total) * 100).toFixed(1),
    }));
  }, [portfolio]);

  if (!data.length) {
    return (
      <div className="text-slate-400 text-center p-4">
        No asset allocation data available.
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-slate-700 w-full 
        transform transition-all duration-900
        ease-out hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50 hover:scale-[1.02]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <h2 className="text-2xl font-semibold text-slate-100 mb-6">
        Portfolio Allocation
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={170}
            labelLine={false}
            label={renderCustomizedLabel}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke={activeIndex === index ? '#ffffff' : 'none'}
                strokeWidth={activeIndex === index ? 3 : 0}
                style={{
                  filter: activeIndex === index ? 'brightness(1.2)' : 
                          activeIndex !== null && activeIndex !== index ? 'brightness(0.6)' : 'none',
                  transition: 'all 0.3s ease',
                   cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='12' fill='%23ffffff' stroke='%233b82f6' stroke-width='2'/><circle cx='16' cy='16' r='4' fill='%233b82f6'/></svg>") 16 16, pointer`
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip active={false} payload={[]} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={12}
            wrapperStyle={{ marginTop: 24 }}
            formatter={(value, entry, index) => {
              const percent = data[index]?.percent;
              return (
                <span 
                  style={{ 
                    color: activeIndex === index ? '#ffffff' : 
                           activeIndex !== null && activeIndex !== index ? '#64748b' : '#cbd5e1',
                    fontSize: '14px',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {value} ({percent}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetAllocationChart;
