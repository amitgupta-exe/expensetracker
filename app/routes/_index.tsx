import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { db } from "~/utils/db.server";

// Import components
import Analytics from "~/components/Analytics";
import FilterDialog from "~/components/FilterDialog";
import DeleteConfirmDialog from "~/components/DeleteConfirmDialog";
import ExpenseList from "~/components/ExpenseList";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string; // Changed from Date to string for serialization
}

export const loader: LoaderFunction = async () => {
  const expenses = await db.expense.findMany({ orderBy: { date: "desc" } });
  // Ensure dates are serialized properly
  const serializedExpenses = expenses.map((expense: any) => ({
    ...expense,
    date: expense.date.toISOString()
  }));
  return json(serializedExpenses);
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const form = await request.formData();
  const intent = form.get("intent");
  const id = Number(form.get("id"));

  if (intent === "delete") {
    await db.expense.delete({ where: { id } });
    return json({ success: true, deleted: id });
  }

  return json({ success: false });
};

export default function Index() {
  const expenses = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filterSummary, setFilterSummary] = useState<string>("All Expenses");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    expenseId?: number;
    expenseDescription?: string;
  }>({ isOpen: false });
  const [mounted, setMounted] = useState(false);

  // Handle hydration properly
  useEffect(() => {
    setMounted(true);
    setFilteredExpenses(expenses);
  }, [expenses]);

  // Prevent hydration mismatch by not rendering content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-full mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

  const handleFilterChange = (filtered: Expense[], summary: string) => {
    setFilteredExpenses(filtered);
    setFilterSummary(summary);
  };

  const handleDeleteClick = (expenseId: number, description: string) => {
    setDeleteDialog({
      isOpen: true,
      expenseId,
      expenseDescription: description
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.expenseId) {
      // Optimistically remove from UI
      const newExpenses = expenses.filter((e: Expense) => e.id !== deleteDialog.expenseId);
      setFilteredExpenses(current => current.filter((e: Expense) => e.id !== deleteDialog.expenseId));

      // Submit delete request using fetcher
      fetcher.submit(
        { intent: 'delete', id: deleteDialog.expenseId.toString() },
        { method: 'post' }
      );
    }
    setDeleteDialog({ isOpen: false });
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-6 h-full">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Left Column - Expenses List */}
            <div className="lg:col-span-4 flex flex-col overflow-y-auto">
              <ExpenseList
                filteredExpenses={filteredExpenses}
                allExpenses={expenses}
                filterSummary={filterSummary}
                totalAmount={totalAmount}
                onFilterClick={() => setIsFilterOpen(true)}
                onDeleteClick={handleDeleteClick}
              />
            </div>

            {/* Right Column - Analytics */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <Analytics expenses={filteredExpenses} title={filterSummary} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        expenses={expenses}
        onFilterChange={handleFilterChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        expenseDescription={deleteDialog.expenseDescription}
      />
    </div>
  );
}
