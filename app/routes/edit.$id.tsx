import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, Link } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ params }) => {
  const id = Number(params.id);
  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) throw new Response("Not Found", { status: 404 });
  return json(expense);
};

export const action: ActionFunction = async ({ request, params }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const intent = form.get("intent");
  
  if (intent === "delete") {
    await db.expense.delete({ where: { id } });
  } else {
    await db.expense.update({
      where: { id },
      data: {
        description: form.get("description") as string,
        amount: parseFloat(form.get("amount") as string),
        category: form.get("category") as string,
        date: new Date(form.get("date") as string),
      },
    });
  }
  return redirect("/");
};

export default function Edit() {
  const expense = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              to="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Expenses
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Expense
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Update your expense details
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <Form method="post" className="p-6 space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input 
                  id="description"
                  name="description" 
                  defaultValue={expense.description} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹)
                </label>
                <input 
                  id="amount"
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  defaultValue={expense.amount} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select 
                  id="category"
                  name="category" 
                  defaultValue={expense.category}
                  required 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input 
                  id="date"
                  name="date" 
                  type="date" 
                  defaultValue={expense.date.slice(0, 10)} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit"
                  name="intent"
                  value="update"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Expense
                </button>
                <button 
                  type="submit"
                  name="intent"
                  value="delete"
                  onClick={(e) => {
                    if (!confirm("Are you sure you want to delete this expense?")) {
                      e.preventDefault();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
                <Link 
                  to="/"
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-md text-center transition duration-200 ease-in-out"
                >
                  Cancel
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
