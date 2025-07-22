# 💰 Expense Tracker

A modern, full-featured expense tracking application built with Remix, TypeScript, and Tailwind CSS. Track your expenses, visualize spending patterns with interactive pie charts, and bulk import data from CSV/Excel files.

![Expense Tracker Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Expense+Tracker+Dashboard)

## ✨ Features

### 📊 **Expense Management**
- **Add Expenses**: Create new expenses with description, amount, category, and date
- **Edit & Delete**: Modify or remove existing expenses with confirmation dialogs
- **Categories**: Organize expenses by categories (Food, Transport, Entertainment, etc.)
- **Real-time Updates**: Instant UI updates with optimistic rendering

### 🔍 **Advanced Filtering**
- **All Expenses**: View complete expense history
- **This Month**: Filter expenses for the current month
- **This Year**: Filter expenses for the current year
- **Custom Date Range**: Select specific date ranges with dual calendar pickers

### 📈 **Data Visualization**
- **Interactive Pie Charts**: Visual breakdown of expenses by category
- **Smart Grouping**: Automatically groups minor categories into "Others"
- **Real-time Analytics**: Charts update based on applied filters
- **Responsive Design**: Charts adapt to different screen sizes

### 📁 **Bulk Import**
- **CSV/Excel Support**: Import expenses from spreadsheet files
- **Drag & Drop**: Easy file upload with visual feedback
- **Data Preview**: See first 5 transactions before importing
- **Smart Validation**: Automatic format checking and error reporting
- **Batch Processing**: Efficient bulk database operations

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Automatic dark/light theme detection
- **Two-Column Layout**: Expenses list and analytics side-by-side
- **Scrollable Sections**: Proper overflow handling for large datasets
- **Loading States**: Smooth loading animations and skeleton screens

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expensetracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5174
   ```

## 🗃️ Database Setup

### Database Schema
The application uses **SQLite** with **Prisma ORM** for data management.

#### Expense Model
```prisma
model Expense {
  id          Int      @id @default(autoincrement())
  description String
  amount      Float
  category    String
  date        DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Database Commands
```bash
# View database in browser
npx prisma studio

# Reset database (⚠️ Deletes all data)
npx prisma db push --force-reset

# Generate client after schema changes
npx prisma generate
```

## 📱 How to Use

### Adding Expenses
1. Click **"Add New Expense"** button on the home page
2. Fill in the form:
   - **Description**: What the expense was for
   - **Amount**: Cost in rupees (₹)
   - **Category**: Select from dropdown or add custom
   - **Date**: When the expense occurred
3. Click **"Add Expense"** to save

### Filtering Expenses
1. Click the **"Filter"** button in the expenses section
2. Choose filter type:
   - **All**: Show all expenses
   - **This Month**: Current month only
   - **This Year**: Current year only
   - **Custom**: Select specific date range
3. Click **"Apply Filters"**

### Importing from Spreadsheet
1. Click **"Import Sheet"** button
2. Prepare your CSV/Excel file with columns:
   ```
   description,amount,category,date
   Groceries,250,Food,2024-01-15
   Gas,80,Transport,2024-01-14
   ```
3. Drag & drop file or click to select
4. Review the preview of first 5 transactions
5. Click **"Import"** to add all expenses

### Viewing Analytics
- **Pie charts** automatically update based on current filters
- **Legend** shows amounts and percentages for each category
- **Single category** displays as a complete circle
- **Multiple categories** show top 4 + "Others" group

## 🏗️ Project Structure

```
expensetracker/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Analytics.tsx    # Analytics dashboard
│   │   ├── ExpenseList.tsx  # Expense list component
│   │   ├── FilterDialog.tsx # Filter modal dialog
│   │   ├── PieChart.tsx     # Interactive pie chart
│   │   └── DeleteConfirmDialog.tsx
│   ├── routes/              # Application routes
│   │   ├── _index.tsx       # Main dashboard
│   │   ├── add.tsx          # Add expense form
│   │   ├── edit.$id.tsx     # Edit expense form
│   │   └── importsheet.tsx  # Bulk import page
│   ├── utils/               # Utility functions
│   │   └── db.server.ts     # Database configuration
│   ├── root.tsx             # Root application component
│   └── tailwind.css         # Tailwind CSS styles
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── dev.db              # SQLite database file
└── public/                  # Static assets
```

## 🛠️ Technology Stack

### Frontend
- **[Remix](https://remix.run/)** - Full-stack React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React](https://reactjs.org/)** - UI library

### Backend
- **[Prisma](https://prisma.io/)** - Database ORM
- **[SQLite](https://sqlite.org/)** - Embedded database
- **Node.js** - JavaScript runtime

### Key Features
- **Server-Side Rendering** - Fast initial page loads
- **Progressive Enhancement** - Works without JavaScript
- **Type Safety** - Full TypeScript coverage
- **Real-time Updates** - Optimistic UI updates

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open database browser
npx prisma generate  # Generate Prisma client
npx prisma db push   # Apply schema changes

# Code Quality
npm run typecheck    # TypeScript type checking
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
```

### Database Configuration
The application uses SQLite by default. To change database:

1. Update `DATABASE_URL` in `.env`
2. Modify `prisma/schema.prisma` provider
3. Run `npx prisma db push`

## 📊 Sample Data Format

For importing expenses, use this CSV format:

```csv
description,amount,category,date
Groceries,250,Food,2024-01-15
Subway,45,Transport,2024-01-14
Netflix,799,Entertainment,2024-01-01
Coffee,120,Food,2024-01-13
```

**Supported Date Formats:**
- `YYYY-MM-DD` (recommended)
- `MM/DD/YYYY`
- `DD/MM/YYYY`
- `MM-DD-YYYY`

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
npx prisma db push
npx prisma generate
```

**Styles Not Loading**
- Clear browser cache
- Restart development server
- Check Tailwind CSS compilation

**Import Not Working**
- Verify CSV column headers match: `description,amount,category,date`
- Check date format is valid
- Ensure amount values are numbers

**Hydration Mismatch**
- Clear browser storage
- Restart development server
- Check for client/server data consistency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Remix](https://remix.run/) framework
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Database management with [Prisma](https://prisma.io/)
- Icons from [Heroicons](https://heroicons.com/)

---

**Happy expense tracking! 💰📊**
