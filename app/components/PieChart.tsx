import React from 'react';

interface Expense {
  id?: number;
  description?: string;
  amount: number;
  category: string;
  date?: Date;
}

interface PieChartProps {
  expenses: Expense[];
  size?: number;
}

export default function PieChart({ expenses, size = 200 }: PieChartProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
        </div>
      </div>
    );
  }

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  if (totalAmount === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl text-gray-400 dark:text-gray-500">₹</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
        </div>
      </div>
    );
  }

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  const categories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5); // Show top 5 categories

  const chartData = categories.map(([category, amount], index) => ({
    category,
    amount,
    percentage: (amount / totalAmount) * 100,
    color: colors[index % colors.length]
  }));

  let currentAngle = 0;
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <svg width={size} height={size} className="transform rotate-0">
        {chartData.map((data, index) => {
          const sliceAngle = (data.percentage / 100) * 360;
          const path = createPath(currentAngle, currentAngle + sliceAngle);
          currentAngle += sliceAngle;

          return (
            <path
              key={data.category}
              d={path}
              fill={data.color}
              stroke="#fff"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity duration-200"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-2 text-sm">
        {chartData.map((data) => (
          <div key={data.category} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: data.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {data.category}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
