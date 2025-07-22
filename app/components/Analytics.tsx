import PieChart from "./PieChart";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string; // Changed from Date to string
}

interface AnalyticsProps {
  expenses: Expense[];
  title?: string;
}

export default function Analytics({ expenses, title = "Analytics" }: AnalyticsProps) {
  // Calculate total amount
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Get date range
  const dates = expenses.map(e => new Date(e.date));
  const earliestDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const latestDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        
        {expenses.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Amount</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
            
            {earliestDate && latestDate && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date Range</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {earliestDate.toLocaleDateString()} - {latestDate.toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              No data available for the selected filters
            </p>
          </div>
        )}
      </div>

      {/* Category Breakdown Pie Chart */}
      {expenses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Breakdown
          </h4>
          <div className="flex justify-center">
            <PieChart expenses={expenses} size={320} />
          </div>
        </div>
      )}
    </div>
  );
}