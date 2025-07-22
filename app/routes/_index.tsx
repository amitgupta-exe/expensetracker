import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { db } from "~/utils/db.server";

// Import components
import Analytics from "~/components/Analytics";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export const loader: LoaderFunction = async () => {
  const expenses = await db.expense.findMany({ orderBy: { date: "desc" } });
  return json(expenses);
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const intent = form.get("intent");
  const id = Number(form.get("id"));
  
  if (intent === "delete") {
    await db.expense.delete({ where: { id } });
  }
  
  return redirect("/");
};

export default function Index() {
  const expenses = useLoaderData<typeof loader>();
  
  const totalAmount = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
  const expenseCount = expenses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Expense Tracker
            </h1>
            <div className="flex justify-center space-x-8 mb-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenseCount}</p>
              </div>
            </div>
            <Link 
              to="/add"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Expense
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Expenses List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Expenses
                  </h2>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto">
                  {expenses.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No expenses yet. Add your first expense to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                      {expenses.map((e: Expense) => (
                        <div key={e.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
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
                                    {e.description}
                                  </p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                                      {e.category}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(e.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  ₹{e.amount.toLocaleString()}
                                </p>
                              </div>
                              <div className="flex flex-col space-y-1">
                                <Link 
                                  to={`/edit/${e.id}`}
                                  className="inline-flex items-center justify-center p-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <Form method="post" className="inline">
                                  <input type="hidden" name="id" value={e.id} />
                                  <button 
                                    type="submit"
                                    name="intent"
                                    value="delete"
                                    onClick={(event) => {
                                      if (!confirm("Are you sure you want to delete this expense?")) {
                                        event.preventDefault();
                                      }
                                    }}
                                    className="inline-flex items-center justify-center p-1.5 border border-red-300 dark:border-red-600 rounded text-xs font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 transition duration-150"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </Form>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Analytics */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Analytics expenses={expenses} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
