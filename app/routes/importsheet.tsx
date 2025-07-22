import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { db } from "~/utils/db.server";

interface ActionData {
  error?: string;
  success?: boolean;
  imported?: number;
  errors?: string[];
}

export const loader: LoaderFunction = async () => {
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return json({ error: "Please select a file to import" });
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return json({ error: "Please upload a CSV or Excel file" });
    }

    // Read file content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return json({ error: "File must contain at least a header row and one data row" });
    }

    // Parse CSV (simple parser)
    const parseCSV = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSV(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
    const dataRows = lines.slice(1);

    // Validate required columns
    const requiredColumns = ['description', 'amount', 'category', 'date'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      return json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}. Expected columns: description, amount, category, date` 
      });
    }

    const expenses = [];
    const errors = [];

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const rowNum = i + 2; // +2 because we start from line 1 and skip header
      const values = parseCSV(dataRows[i]);
      
      if (values.length !== headers.length) {
        errors.push(`Row ${rowNum}: Column count mismatch`);
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.replace(/['"]/g, '') || '';
      });

      // Validate and convert data
      const description = row.description?.trim();
      if (!description) {
        errors.push(`Row ${rowNum}: Description is required`);
        continue;
      }

      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Row ${rowNum}: Invalid amount "${row.amount}"`);
        continue;
      }

      const category = row.category?.trim();
      if (!category) {
        errors.push(`Row ${rowNum}: Category is required`);
        continue;
      }

      // Parse date - try multiple formats
      let date: Date;
      try {
        const dateStr = row.date?.trim();
        if (!dateStr) {
          errors.push(`Row ${rowNum}: Date is required`);
          continue;
        }

        // Try different date formats
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateStr);
        } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [month, day, year] = dateStr.split('/');
          date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          const [month, day, year] = dateStr.split('/');
          date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        } else {
          date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) {
          errors.push(`Row ${rowNum}: Invalid date "${dateStr}". Use YYYY-MM-DD or MM/DD/YYYY format`);
          continue;
        }
      } catch {
        errors.push(`Row ${rowNum}: Invalid date "${row.date}"`);
        continue;
      }

      expenses.push({
        description,
        amount,
        category,
        date
      });
    }

    // If there are errors but some valid expenses, ask user what to do
    if (errors.length > 0 && expenses.length === 0) {
      return json({ error: "No valid expenses found", errors });
    }

    // Import valid expenses
    if (expenses.length > 0) {
      await db.expense.createMany({
        data: expenses
      });
    }

    return json({ 
      success: true, 
      imported: expenses.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Import error:', error);
    return json({ error: "Failed to process file. Please check the format and try again." });
  }
};

export default function ImportSheet() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string>("");

  const isSubmitting = navigation.state === "submitting";

  const parseCSV = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const previewFile = async (file: File) => {
    try {
      setPreviewError("");
      setPreviewData([]);
      
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setPreviewError("File must contain at least a header row and one data row");
        return;
      }

      const headers = parseCSV(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
      const requiredColumns = ['description', 'amount', 'category', 'date'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        setPreviewError(`Missing required columns: ${missingColumns.join(', ')}`);
        return;
      }

      const preview = [];
      const dataRows = lines.slice(1, 6); // Get first 5 rows

      for (let i = 0; i < dataRows.length; i++) {
        const values = parseCSV(dataRows[i]);
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index]?.replace(/['"]/g, '') || '';
        });

        preview.push({
          description: row.description?.trim() || 'N/A',
          amount: row.amount || 'N/A',
          category: row.category?.trim() || 'N/A',
          date: row.date?.trim() || 'N/A'
        });
      }

      setPreviewData(preview);
    } catch (error) {
      setPreviewError("Error reading file. Please check the format.");
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    previewFile(file);
  };

  // Reset preview when form is submitted successfully
  useEffect(() => {
    if (actionData?.success) {
      setSelectedFile(null);
      setPreviewData([]);
      setPreviewError("");
      // Clear the file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }, [actionData?.success]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.files = files;
      }
      handleFileSelect(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Import Expenses
              </h1>
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to Home
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Upload a CSV or Excel file to import your expenses. Make sure your file includes columns for: description, amount, category, and date.
            </p>
          </div>

          {/* Upload Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <Form method="post" encType="multipart/form-data">
              <div className="space-y-6">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file"
                      name="file"
                      accept=".csv,.xlsx,.xls"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(file);
                        }
                      }}
                    />
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        CSV, Excel (.xlsx, .xls) up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Selected Feedback */}
                {selectedFile && (
                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Error */}
                {previewError && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800 dark:text-red-200 font-medium">
                        {previewError}
                      </span>
                    </div>
                  </div>
                )}

                {/* Data Preview */}
                {previewData.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                      Preview: First {previewData.length} transactions
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-green-200 dark:border-green-700">
                            <th className="text-left py-2 text-green-800 dark:text-green-200 font-medium">Description</th>
                            <th className="text-left py-2 text-green-800 dark:text-green-200 font-medium">Amount</th>
                            <th className="text-left py-2 text-green-800 dark:text-green-200 font-medium">Category</th>
                            <th className="text-left py-2 text-green-800 dark:text-green-200 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b border-green-100 dark:border-green-800">
                              <td className="py-2 text-green-700 dark:text-green-300">{row.description}</td>
                              <td className="py-2 text-green-700 dark:text-green-300">{row.amount}</td>
                              <td className="py-2 text-green-700 dark:text-green-300">{row.category}</td>
                              <td className="py-2 text-green-700 dark:text-green-300">{row.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      ✓ File format looks good! Ready to import.
                    </p>
                  </div>
                )}

                {/* Sample Format */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Expected File Format:
                  </h3>
                  <div className="text-xs font-mono bg-white dark:bg-gray-800 p-3 rounded border">
                    <div className="text-gray-600 dark:text-gray-400">
                      description,amount,category,date<br />
                      "Coffee",4.50,"Food","2024-07-22"<br />
                      "Gas",45.00,"Transportation","07/21/2024"<br />
                      "Groceries",85.30,"Food","2024-07-20"
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Date formats supported: YYYY-MM-DD or MM/DD/YYYY
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile || previewError !== ""}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Importing..." : 
                   !selectedFile ? "Select a file to import" : 
                   previewError ? "Fix errors to continue" : 
                   `Import ${previewData.length > 0 ? previewData.length + '+' : ''} Expenses`}
                </button>
              </div>
            </Form>

            {/* Results */}
            {actionData?.success && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    Successfully imported {actionData.imported} expenses!
                  </span>
                </div>
                {actionData.errors && actionData.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                      Note: {actionData.errors.length} rows had errors and were skipped:
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400 max-h-32 overflow-y-auto">
                      {actionData.errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <Link 
                    to="/" 
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline"
                  >
                    View imported expenses →
                  </Link>
                </div>
              </div>
            )}

            {actionData?.error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      {actionData.error}
                    </span>
                    {actionData.errors && actionData.errors.length > 0 && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400 max-h-32 overflow-y-auto">
                        {actionData.errors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
