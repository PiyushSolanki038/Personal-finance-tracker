import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Dashboard.css';
import { formatCurrency } from '../utils/formatCurrency';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [summary, setSummary] = useState({
    currentBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/summary');
      setSummary(response.data.summary);
      setRecentTransactions(response.data.recentTransactions);
      
      // Configure chart data with proper scales
      setChartData({
        labels: response.data.chartLabels,
        datasets: [
          {
            label: 'Income',
            data: response.data.incomeData,
            borderColor: '#2196F3',
            fill: false,
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: response.data.expenseData,
            borderColor: '#f44336',
            fill: false,
            tension: 0.4
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="summary-cards">
        
        <div className="summary-card">
          <h3>Current Balance</h3>
          <p className="amount">{formatCurrency(summary.currentBalance)}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-container">
          <h2>Income vs Expenses</h2>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="recent-transactions">
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction._id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-info">
                  <h4>{transaction.description}</h4>
                  <p>{transaction.category}</p>
                </div>
                <div className="transaction-amount">
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;