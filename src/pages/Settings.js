import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      currency: 'INR'
    },
    notifications: {
      emailAlerts: false,
      budgetAlerts: true,
      weeklyReport: false
    },
    categories: [],
    newCategory: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  // Add axios config with auth token
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  
  // Update fetchSettings
  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings', getAuthConfig());
      const userName = localStorage.getItem('userName');
      setSettings(prevSettings => ({
        ...prevSettings,
        ...response.data,
        profile: {
          ...response.data.profile,
          name: userName || response.data.profile.name
        },
        newCategory: ''
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };
  
  // Update handleProfileUpdate
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const profileData = {
        name: settings.profile.name,
        email: settings.profile.email,
        currency: settings.profile.currency
      };
  
      const response = await axios.put(
        'http://localhost:5000/api/settings/profile', 
        profileData,
        getAuthConfig()
      );
      
      setSettings(prevSettings => ({
        ...prevSettings,
        profile: response.data
      }));
      setMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
    }
    setTimeout(() => setMessage(''), 3000);
  };
  
  // Update handleNotificationUpdate
  const handleNotificationUpdate = async (key) => {
    const updatedNotifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key]
    };
    try {
      await axios.put(
        'http://localhost:5000/api/settings/notifications', 
        updatedNotifications,
        getAuthConfig()
      );
      setSettings({ ...settings, notifications: updatedNotifications });
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };
  
  // Update handleAddCategory
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!settings.newCategory.trim()) return;
  
    try {
      await axios.post(
        'http://localhost:5000/api/settings/categories',
        { category: settings.newCategory },
        getAuthConfig()
      );
      setSettings({
        ...settings,
        categories: [...settings.categories, settings.newCategory],
        newCategory: ''
      });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };
  
  // Update handleDeleteCategory
  const handleDeleteCategory = async (category) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/settings/categories/${category}`,
        getAuthConfig()
      );
      setSettings({
        ...settings,
        categories: settings.categories.filter(c => c !== category)
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      {message && <div className="message">{message}</div>}

      <section className="profile-section">
        <h2>Profile Settings</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, name: e.target.value }
              })}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, email: e.target.value }
              })}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select
              value={settings.profile.currency}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, currency: e.target.value }
              })}
              disabled={!isEditing}
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          {isEditing ? (
            <button type="submit">Save Changes</button>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </form>
      </section>

      <section className="notifications-section">
        <h2>Notification Preferences</h2>
        <div className="notification-options">
          <div className="notification-option">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.emailAlerts}
                onChange={() => handleNotificationUpdate('emailAlerts')}
              />
              Email Alerts
            </label>
          </div>
          <div className="notification-option">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.budgetAlerts}
                onChange={() => handleNotificationUpdate('budgetAlerts')}
              />
              Budget Alerts
            </label>
          </div>
          <div className="notification-option">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReport}
                onChange={() => handleNotificationUpdate('weeklyReport')}
              />
              Weekly Report
            </label>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2>Manage Categories</h2>
        <form onSubmit={handleAddCategory} className="add-category-form">
          <input
            type="text"
            value={settings.newCategory}
            onChange={(e) => setSettings({ ...settings, newCategory: e.target.value })}
            placeholder="New category name"
          />
          <button type="submit">Add Category</button>
        </form>

        <div className="categories-list">
          {settings.categories.map((category) => (
            <div key={category} className="category-item">
              <span>{category}</span>
              <button onClick={() => handleDeleteCategory(category)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Settings;