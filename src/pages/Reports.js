import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    totalBudget: 0,
    categorySpending: {},
    monthlySpending: {}
  });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchData();
    
    // Listen for transaction updates
    const handleTransactionUpdate = () => {
      fetchData();
    };

    // Add event listener for transaction updates
    window.addEventListener('transactionUpdated', handleTransactionUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('transactionUpdated', handleTransactionUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transaction', getAuthConfig());
      const allTransactions = response.data;
      console.log('Fetched transactions:', allTransactions); // Debug log
      setTransactions(allTransactions);

      // Calculate summary immediately with new transactions
      const currentDate = new Date();
      const currentMonthTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentDate.getMonth() &&
               transactionDate.getFullYear() === currentDate.getFullYear();
      });

      calculateSummary(currentMonthTransactions);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTransactions([]);
    }
  };

  const calculateSummary = (transactions) => {
    const categorySpending = {};
    const monthlySpending = {};
    let totalSpent = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

      if (!isNaN(amount)) {
        categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + amount;
        monthlySpending[monthYear] = (monthlySpending[monthYear] || 0) + amount;
        totalSpent += amount;
      }
    });

    setSummary({
      totalSpent,
      totalBudget: 0, // Remove budget dependency
      categorySpending,
      monthlySpending
    });
  };

  // Add the formatINR function back
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="reports-page">
      <h1>Financial Reports</h1>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p className="amount">{formatINR(summary.totalSpent)}</p>
        </div>
      </div>

      <div className="category-analysis">
        <h2>Category-wise Analysis</h2>
        {Object.entries(summary.categorySpending).map(([category, spent]) => (
          <div key={category} className="category-item">
            <div className="category-header">
              <h3>{category}</h3>
              <div className="amounts">
                <span>{formatINR(spent)}</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress"
                style={{ 
                  width: '100%',
                  backgroundColor: '#4CAF50'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="monthly-analysis">
        <h2>Monthly Spending</h2>
        {Object.entries(summary.monthlySpending)
          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
          .map(([month, amount]) => (
            <div key={month} className="monthly-item">
              <span className="month">{month}</span>
              <span className="amount">{formatINR(amount)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Reports;