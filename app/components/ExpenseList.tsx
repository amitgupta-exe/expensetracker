import { Link } from "@remix-run/react";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpenseListProps {
  filteredExpenses: Expense[];
  allExpenses: Expense[];
  filterSummary: string;
  totalAmount: number;
  onFilterClick: () => void;
  onDeleteClick: (expenseId: number, description: string) => void;
}

export default function ExpenseList({
  filteredExpenses,
  allExpenses,
  filterSummary,
  totalAmount,
  onFilterClick,
  onDeleteClick,
}: ExpenseListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full max-h-[90vh]">
      {/* Header Section */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              EXPENSE TRACKER
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filterSummary} ({filteredExpenses.length} {filteredExpenses.length === 1 ? 'entry' : 'entries'})
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</p>
          </div>
          <button
            onClick={onFilterClick}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.121A1 1 0 013 6.414V4z" />
            </svg>
            Filter
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="text-center mt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/add"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Expense
            </Link>
            <Link
              to="/importsheet"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import Sheet
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Expense List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center h-full flex items-center justify-center">
            <div>
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {allExpenses.length === 0 ? "No expenses yet. Add your first expense to get started!" : "No expenses match the current filters."}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredExpenses.map((expense: Expense) => (
              <div key={expense.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                            ₹
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                          {expense.description}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            {expense.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{expense.amount.toLocaleString()}
                      </p>
                    </div>

                      <Link
                        to={`/edit/${expense.id}`}
                        className="inline-flex items-center justify-center p-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => onDeleteClick(expense.id, expense.description)}
                        className="inline-flex items-center justify-center p-1.5 border border-red-300 dark:border-red-600 rounded text-xs font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 transition duration-150"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
