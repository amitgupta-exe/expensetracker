import { ActionFunction, redirect, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";

interface ActionData {
  errors?: {
    description?: string;
    amount?: string;
    category?: string;
    date?: string;
  };
  values?: {
    description?: string;
    amount?: string;
    category?: string;
    date?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const description = form.get("description") as string;
  const amount = form.get("amount") as string;
  const category = form.get("category") as string;
  const date = form.get("date") as string;

  // Server-side validation
  const errors: ActionData["errors"] = {};
  
  if (!description || description.trim().length === 0) {
    errors.description = "Description is required";
  }
  
  if (!amount || isNaN(parseFloat(amount))) {
    errors.amount = "Please enter a valid amount";
  } else if (parseFloat(amount) <= 0) {
    errors.amount = "Amount must be greater than 0";
  }
  
  if (!category) {
    errors.category = "Please select a category";
  }
  
  if (!date) {
    errors.date = "Date is required";
  } else {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (selectedDate > today) {
      errors.date = "Date cannot be in the future";
    }
  }

  // If there are errors, return them with the form values
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({
      errors,
      values: { description, amount, category, date }
    }, { status: 400 });
  }

  // If validation passes, create the expense
  await db.expense.create({
    data: {
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date: new Date(date),
    },
  });
  
  return redirect("/");
};

export default function Add() {
  const actionData = useActionData<ActionData>();
  const today = new Date().toISOString().split('T')[0];

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
              Add New Expense
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Record a new expense to track your spending
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
                  placeholder="What did you spend on?" 
                  required 
                  defaultValue={actionData?.values?.description || ""}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    actionData?.errors?.description 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {actionData?.errors?.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.description}
                  </p>
                )}
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
                  min="0.01"
                  placeholder="0.00" 
                  required 
                  defaultValue={actionData?.values?.amount || ""}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    actionData?.errors?.amount 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {actionData?.errors?.amount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select 
                  id="category"
                  name="category" 
                  required 
                  defaultValue={actionData?.values?.category || ""}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    actionData?.errors?.category 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
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
                {actionData?.errors?.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.category}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input 
                  id="date"
                  name="date" 
                  type="date" 
                  required 
                  max={today}
                  defaultValue={actionData?.values?.date || today}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    actionData?.errors?.date 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {actionData?.errors?.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.date}
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Expense
                </button>
                <Link 
                  to="/"
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-md text-center transition duration-200 ease-in-out"
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
