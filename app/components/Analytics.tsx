import PieChart from "./PieChart";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

interface AnalyticsProps {
  expenses: Expense[];
}

export default function Analytics({ expenses }: AnalyticsProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Get unique years from expenses
  const years = [...new Set(expenses.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Filter expenses by year
  const getExpensesByYear = (year: number) => {
    return expenses.filter(e => new Date(e.date).getFullYear() === year);
  };

  // Filter expenses by month and year
  const getExpensesByMonth = (year: number, month: number) => {
    return expenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  // Group expenses by year for pie chart
  const expensesByYear = years.reduce((acc, year) => {
    const yearExpenses = getExpensesByYear(year);
    const total = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    if (total > 0) {
      acc.push({ category: year.toString(), amount: total });
    }
    return acc;
  }, [] as { category: string; amount: number }[]);

  // Group expenses by month for current year
  const expensesByMonth = months.reduce((acc, month, index) => {
    const monthExpenses = getExpensesByMonth(currentYear, index);
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    if (total > 0) {
      acc.push({ category: month, amount: total });
    }
    return acc;
  }, [] as { category: string; amount: number }[]);

  // Current year expenses
  const currentYearExpenses = getExpensesByYear(currentYear);
  
  // Current month expenses
  const currentMonthExpenses = getExpensesByMonth(currentYear, currentMonth);

  return (
    <div className="space-y-6">
      {/* Year-wise Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expenses by Year
        </h3>
        {expensesByYear.length > 0 ? (
          <div className="flex justify-center">
            <PieChart expenses={expensesByYear} />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No data available
          </p>
        )}
      </div>

      {/* Month-wise Analytics for Current Year */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Expenses ({currentYear})
        </h3>
        {expensesByMonth.length > 0 ? (
          <div className="flex justify-center">
            <PieChart expenses={expensesByMonth} />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No data for {currentYear}
          </p>
        )}
      </div>

      {/* Category-wise Analytics - Overall */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categories (Overall)
        </h3>
        {expenses.length > 0 ? (
          <div className="flex justify-center">
            <PieChart expenses={expenses} />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No expenses recorded
          </p>
        )}
      </div>

      {/* Category-wise Analytics - Current Year */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categories ({currentYear})
        </h3>
        {currentYearExpenses.length > 0 ? (
          <div className="flex justify-center">
            <PieChart expenses={currentYearExpenses} />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No expenses for {currentYear}
          </p>
        )}
      </div>

      {/* Category-wise Analytics - Current Month */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categories ({months[currentMonth]} {currentYear})
        </h3>
        {currentMonthExpenses.length > 0 ? (
          <div className="flex justify-center">
            <PieChart expenses={currentMonthExpenses} />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No expenses for {months[currentMonth]} {currentYear}
          </p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Years</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{years.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Year</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{currentYearExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}