import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transactions.css';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions', getAuthConfig());
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/transactions', newTransaction, getAuthConfig());
      if (response.data) {
        // After successful transaction creation
        window.dispatchEvent(new Event('transactionUpdated'));
        fetchTransactions();
        setNewTransaction({
          description: '',
          amount: '',
          type: 'expense',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>
      
      <div className="add-transaction-form">
        <h2>Add New Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
              required
            />
          </div>
          <button type="submit">Add Transaction</button>
        </form>
      </div>

      <div className="transactions-list">
        <h2>Recent Transactions</h2>
        {transactions.map((transaction) => (
          <div key={transaction._id} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-info">
              <h4>{transaction.description}</h4>
              <p>{transaction.category}</p>
              <small>{new Date(transaction.date).toLocaleDateString()}</small>
            </div>
            <div className="transaction-amount">
              ${transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transactions;