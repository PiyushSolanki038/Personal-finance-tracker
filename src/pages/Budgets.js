import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Budgets.css';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'Monthly'
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings', getAuthConfig());
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      // Use the main budgets endpoint
      const response = await axios.get('http://localhost:5000/api/budgets', getAuthConfig());
      console.log('Fetched budgets:', response.data);

      if (Array.isArray(response.data)) {
        const sortedBudgets = response.data
          .filter(budget => budget && budget._id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('Processed budgets:', sortedBudgets);
        setBudgets(sortedBudgets);
      } else if (response.data) {
        console.log('Single budget response:', response.data);
        setBudgets([response.data]);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      console.log('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      setBudgets([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        period: newBudget.period
      };

      if (!budgetData.category) {
        alert('Please select a category');
        return;
      }

      if (isNaN(budgetData.amount) || budgetData.amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/budgets', budgetData, getAuthConfig());
      console.log('Created budget:', response.data);
      
      if (response.data) {
        // Update the budgets list by adding the new budget and maintaining the existing ones
        setBudgets(prevBudgets => {
          const updatedBudgets = [...prevBudgets];
          updatedBudgets.unshift(response.data); // Add new budget at the beginning
          return updatedBudgets;
        });
        
        setNewBudget({
          category: '',
          amount: '',
          period: 'Monthly'
        });
      }
    } catch (error) {
      console.log('Full error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error adding budget';
      alert(`Failed to create budget: ${errorMessage}`);
    }
  };

  // Add currency formatter
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleDelete = async (budgetId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/budgets/${budgetId}`, getAuthConfig());
      if (response.status === 200) {
        // Remove the deleted budget from state
        setBudgets(prevBudgets => prevBudgets.filter(budget => budget._id !== budgetId));
      } else {
        throw new Error('Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  };

  // Update in the render section where amounts are displayed
  return (
    <div className="budgets-page">
      <h1>Budget Planning</h1>

      <div className="add-budget-form">
        <h2>Create New Budget</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
              min="0"
              step="0.01"
              required
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

      <div className="budgets-list">
        <h2>Current Budgets</h2>
        {budgets.map((budget) => (
          <div key={budget._id} className="budget-item">
            <div className="budget-info">
              <h4>{budget.category}</h4>
              <p>{budget.period}</p>
            </div>
            <div className="budget-amount">
              <div className="amount-info">
                <span className="target">{formatINR(budget.amount)}</span>
                <span className="spent">{formatINR(budget.spent || 0)} spent</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ 
                    width: `${Math.min((budget.spent || 0) / budget.amount * 100, 100)}%`,
                    backgroundColor: (budget.spent || 0) > budget.amount ? '#f44336' : '#4CAF50'
                  }}
                ></div>
              </div>
            </div>
            <button 
              className="delete-button"
              onClick={() => handleDelete(budget._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Budgets;