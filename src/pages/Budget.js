import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Budget.css';
import { formatCurrency } from '../utils/formatCurrency';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'Monthly'
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const categories = [
    'Food', 'Transportation', 'Housing', 'Utilities', 
    'Entertainment', 'Healthcare', 'Shopping', 'Other'
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/budgets');
      setBudgets(response.data);
      updateChartData(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const updateChartData = (budgetData) => {
    setChartData({
      labels: budgetData.map(b => b.category),
      datasets: [
        {
          label: 'Budget',
          data: budgetData.map(b => b.amount),
          backgroundColor: '#2196F3'
        },
        {
          label: 'Actual Expenses',
          data: budgetData.map(b => b.spent || 0),
          backgroundColor: '#f44336'
        }
      ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/budgets', newBudget);
      setNewBudget({ category: '', amount: '', period: 'Monthly' });
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/budgets/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  return (
    <div className="budget-page">
      <h1>Budget Management</h1>

      <div className="budget-container">
        <div className="create-budget">
          <h2>Create Budget</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Period</label>
              <select
                value={newBudget.period}
                onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <button type="submit">Create Budget</button>
          </form>
        </div>

        <div className="budget-overview">
          <h2>Budget Overview</h2>
          <div className="chart-container">
            <Bar data={chartData} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      <div className="budget-list">
        <h2>Budget List</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget Amount</th>
              <th>Period</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget._id}>
                <td>{budget.category}</td>
                <td>{formatCurrency(budget.amount)}</td>
                <td>{budget.period}</td>
                <td>{formatCurrency(budget.spent || 0)}</td>
                <td>{formatCurrency(budget.amount - (budget.spent || 0))}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(budget._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Budget;