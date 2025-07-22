import { useState, useEffect } from "react";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string; // Changed from Date to string
}

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onFilterChange: (filteredExpenses: Expense[], filterSummary: string) => void;
}

export default function FilterDialog({ isOpen, onClose, expenses, onFilterChange }: FilterDialogProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Manage body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Reset custom dates when filter type changes
  useEffect(() => {
    if (filterType !== "custom") {
      setFromDate("");
      setToDate("");
    }
  }, [filterType]);

  if (!isOpen) return null;

  const applyFilters = () => {
    let filtered = [...expenses];
    let summary = "All Expenses";

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (filterType) {
      case "all":
        filtered = expenses;
        summary = "All Expenses";
        break;

      case "this-month":
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
        
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
        });
        
        const monthName = now.toLocaleString('default', { month: 'long' });
        summary = `${monthName} ${currentYear}`;
        break;

      case "this-year":
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);
        
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startOfYear && expenseDate <= endOfYear;
        });
        
        summary = `Year ${currentYear}`;
        break;

      case "custom":
        if (fromDate && toDate) {
          const startDate = new Date(fromDate);
          const endDate = new Date(toDate);
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          
          filtered = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
          });
          
          const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
          summary = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
        } else {
          // If custom is selected but no dates are provided, show all
          filtered = expenses;
          summary = "All Expenses (Custom dates not set)";
        }
        break;

      default:
        filtered = expenses;
        summary = "All Expenses";
    }

    onFilterChange(filtered, summary);
    onClose();
  };

  const clearFilters = () => {
    setFilterType("all");
    setFromDate("");
    setToDate("");
    onFilterChange(expenses, "All Expenses");
    onClose();
  };

  // Get today's date for max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto modal-backdrop" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-dialog-title"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Dialog */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full modal-dialog">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 
                    id="filter-dialog-title"
                    className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                  >
                    Filter Expenses
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Close dialog"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Filter Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Filter By
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="filterType"
                          value="all"
                          checked={filterType === "all"}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All Expenses</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="filterType"
                          value="this-month"
                          checked={filterType === "this-month"}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">This Month</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="filterType"
                          value="this-year"
                          checked={filterType === "this-year"}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">This Year</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="filterType"
                          value="custom"
                          checked={filterType === "custom"}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Custom Date Range</span>
                      </label>
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  {filterType === "custom" && (
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            From Date
                          </label>
                          <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            max={toDate || today}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            To Date
                          </label>
                          <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            min={fromDate}
                            max={today}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      {fromDate && toDate && new Date(fromDate) > new Date(toDate) && (
                        <div className="text-red-600 dark:text-red-400 text-sm">
                          From date cannot be later than to date
                        </div>
                      )}
                    </div>
                  )}

                  {/* Filter Preview */}
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-blue-800 dark:text-blue-200">
                        {filterType === "all" && "Showing all expenses"}
                        {filterType === "this-month" && `Showing expenses for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                        {filterType === "this-year" && `Showing expenses for ${new Date().getFullYear()}`}
                        {filterType === "custom" && !fromDate && !toDate && "Select date range to filter"}
                        {filterType === "custom" && fromDate && toDate && `Showing expenses from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`}
                        {filterType === "custom" && (fromDate || toDate) && !(fromDate && toDate) && "Please select both from and to dates"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={applyFilters}
              disabled={
                filterType === "custom" && 
                (!fromDate || !toDate || new Date(fromDate) > new Date(toDate))
              }
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
