const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const PDFDocument = require('pdfkit');
const json2csv = require('json2csv').parse;

// Get report data
router.get('/', async (req, res) => {
  try {
    const { timeframe } = req.query;
    const startDate = getStartDate(timeframe);
    
    // Fetch transactions and budgets
    const transactions = await Transaction.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    const budgets = await Budget.find();

    // Generate report data
    const incomeExpenseData = generateIncomeExpenseData(transactions);
    const categoryData = generateCategoryData(transactions);
    const summary = calculateSummary(transactions, budgets);

    res.json({
      incomeExpenseData,
      categoryData,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export report as PDF
router.get('/export/pdf', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    const budgets = await Budget.find();
    const summary = calculateSummary(transactions, budgets);
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    doc.pipe(res);
    
    // Generate PDF content
    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.moveDown();
    
    // Summary Section
    doc.fontSize(16).text('Summary');
    doc.fontSize(12)
      .text(`Total Income: ₹${summary.totalIncome.toLocaleString('en-IN')}`)
      .text(`Total Expenses: ₹${summary.totalExpenses.toLocaleString('en-IN')}`)
      .text(`Net Savings: ₹${summary.netSavings.toLocaleString('en-IN')}`)
      .text(`Savings Rate: ${summary.savingsRate.toFixed(1)}%`);
    
    doc.moveDown();
    
    // Transactions Section
    doc.fontSize(16).text('Recent Transactions');
    transactions.forEach(t => {
      doc.fontSize(12).text(
        `${new Date(t.date).toLocaleDateString()} - ${t.description} - ${t.category} - ₹${t.amount.toLocaleString('en-IN')} (${t.type})`
      );
    });
    
    doc.moveDown();
    
    // Budget Section
    doc.fontSize(16).text('Budget Overview');
    summary.budgetUtilization.forEach(b => {
      doc.fontSize(12).text(
        `${b.category}: Budget ₹${b.budget.toLocaleString('en-IN')} - Spent ₹${b.spent.toLocaleString('en-IN')} - Remaining ₹${b.remaining.toLocaleString('en-IN')}`
      );
    });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export report as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    const fields = ['date', 'description', 'amount', 'type', 'category'];
    
    const csvData = transactions.map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      description: t.description,
      amount: `₹${t.amount.toLocaleString('en-IN')}`,
      type: t.type,
      category: t.category
    }));
    
    const csv = json2csv(csvData, { fields });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function getStartDate(timeframe) {
  const now = new Date();
  switch (timeframe) {
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarterly':
      return new Date(now.getFullYear(), now.getMonth() - 3, 1);
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function generateIncomeExpenseData(transactions) {
  const groupedData = transactions.reduce((acc, t) => {
    const date = t.date.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[date].income += t.amount;
    } else {
      acc[date].expense += t.amount;
    }
    return acc;
  }, {});

  const labels = Object.keys(groupedData).sort();
  
  return {
    labels,
    datasets: [
      {
        label: 'Income',
        data: labels.map(date => groupedData[date].income),
        borderColor: '#4CAF50',
        fill: false
      },
      {
        label: 'Expenses',
        data: labels.map(date => groupedData[date].expense),
        borderColor: '#f44336',
        fill: false
      }
    ]
  };
}

function generateCategoryData(transactions) {
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  return {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#2196F3', '#F44336'
      ]
    }]
  };
}

function calculateSummary(transactions, budgets) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = budgets
    .reduce((sum, b) => sum + b.amount, 0);

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // Update spent amounts in budgets
  budgets.forEach(budget => {
    budget.spent = expensesByCategory[budget.category] || 0;
  });

  return {
    totalIncome,
    totalExpenses,
    totalBudget,
    netSavings: totalIncome - totalExpenses,
    savingsRate: totalIncome ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    budgetUtilization: budgets.map(b => ({
      category: b.category,
      budget: b.amount,
      spent: b.spent,
      remaining: b.amount - b.spent
    }))
  };
}

module.exports = router;