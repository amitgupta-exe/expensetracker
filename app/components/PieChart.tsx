import React from 'react';

interface Expense {
  id?: number;
  description?: string;
  amount: number;
  category: string;
  date?: string; // Changed from Date to string
}

interface PieChartProps {
  expenses: Expense[];
  size?: number;
}

export default function PieChart({ expenses, size = 280 }: PieChartProps) {
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
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
    '#6B7280' // Gray color for "Others"
  ];

  // Sort categories by amount (highest first)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a);

  let chartData;
  
  if (sortedCategories.length <= 5) {
    // If 5 or fewer categories, show all
    chartData = sortedCategories.map(([category, amount], index) => ({
      category,
      amount,
      percentage: (amount / totalAmount) * 100,
      color: colors[index % colors.length]
    }));
  } else {
    // If more than 5 categories, show top 4 + "Others"
    const topCategories = sortedCategories.slice(0, 4);
    const otherCategories = sortedCategories.slice(4);
    
    const othersAmount = otherCategories.reduce((sum, [, amount]) => sum + amount, 0);
    const othersCount = otherCategories.length;
    
    chartData = [
      ...topCategories.map(([category, amount], index) => ({
        category,
        amount,
        percentage: (amount / totalAmount) * 100,
        color: colors[index % colors.length]
      })),
      {
        category: `Others (${othersCount} categories)`,
        amount: othersAmount,
        percentage: (othersAmount / totalAmount) * 100,
        color: colors[4] // Use the 5th color for "Others"
      }
    ];
  }

  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  // Special case: if there's only one slice (100%), draw a circle instead of a path
  if (chartData.length === 1) {
    const singleData = chartData[0];
    return (
      <div className="flex flex-col items-center space-y-4">
        <svg width={size} height={size} className="transform rotate-0">
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill={singleData.color}
            stroke="#fff"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity duration-200"
          >
            <title>{`${singleData.category}: ₹${singleData.amount.toLocaleString()} (${singleData.percentage.toFixed(1)}%)`}</title>
          </circle>
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-2 text-sm max-w-xs">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: singleData.color }}
              />
              <span className="text-gray-700 dark:text-gray-300 truncate text-xs">
                {singleData.category}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-xs whitespace-nowrap">
              ₹{singleData.amount.toLocaleString()} (100%)
            </span>
          </div>
        </div>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400">
            Single category: 100% | Categories: {Object.keys(categoryTotals).length}
          </div>
        )}
      </div>
    );
  }

  // Multiple slices - use path drawing
  let currentAngle = 0;

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

  // Verify that all percentages add up to 100%
  const totalPercentage = chartData.reduce((sum, data) => sum + data.percentage, 0);
  
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
            >
              <title>{`${data.category}: ₹${data.amount.toLocaleString()} (${data.percentage.toFixed(1)}%)`}</title>
            </path>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-2 text-sm max-w-xs">
        {chartData.map((data) => (
          <div key={data.category} className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: data.color }}
              />
              <span className="text-gray-700 dark:text-gray-300 truncate text-xs">
                {data.category}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-xs whitespace-nowrap">
              ₹{data.amount.toLocaleString()} ({data.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400">
          Total: {totalPercentage.toFixed(1)}% | Categories: {Object.keys(categoryTotals).length}
        </div>
      )}
    </div>
  );
}
