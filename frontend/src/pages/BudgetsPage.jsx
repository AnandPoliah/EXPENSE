// frontend/src/pages/BudgetsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { FaSave } from "react-icons/fa"; // Removed FaSyncAlt as it was unused
import "./BudgetsPage.css"; // ⭐ CSS Import

// Format number to currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper to get YYYY-MM format
const getCurrentMonthYear = () => {
  return new Date().toISOString().substring(0, 7);
};

const BudgetsPage = () => {
  const { apiClient } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [categories, setCategories] = useState([]);
  const [budgetsMap, setBudgetsMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // --- Data Fetching Logic (FR3.3) ---

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch all user categories
      const categoriesRes = await apiClient.get("/categories");
      setCategories(categoriesRes.data); // 2. Fetch existing budgets for the selected month

      const budgetsRes = await apiClient.get(`/budgets?month=${selectedMonth}`); // Convert array of budgets into a map for easy lookup

      const newBudgetsMap = budgetsRes.data.reduce((map, budget) => {
        map[budget.category_id] = budget.budgeted_amount;
        return map;
      }, {});
      setBudgetsMap(newBudgetsMap);
    } catch (err) {
      setError("Failed to load budget data or categories.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, selectedMonth]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]); // --- Handlers ---

  const handleBudgetChange = (categoryId, value) => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    setBudgetsMap((prev) => ({
      ...prev,
      [categoryId]: value, // Store as string for input field
    }));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    const updates = categories.map((category) => {
      const amount = parseFloat(budgetsMap[category.id]) || 0; // Default to 0 if input is empty/invalid // Call the backend upsert endpoint for each category (FR3.1)

      return apiClient.post("/budgets", {
        categoryId: category.id,
        monthYear: selectedMonth,
        amount: amount,
      });
    });

    try {
      await Promise.all(updates);
      setMessage(`Successfully saved budgets for ${selectedMonth}!`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save one or more budgets."
      );
      console.error(err);
    } finally {
      setSaving(false);
    }
  }; // --- Render Logic ---

  if (loading) {
    return <div className="loading-message">Loading budget data...</div>;
  }

  if (error && !saving) {
    return <div className="error-box">        {error}      </div>;
  }

  return (
    <div className="budgets-container">
           {" "}
      <h1 className="page-title">        Monthly Budget Manager       </h1>     {" "}
      {/* Month Selector */}     {" "}
      <div className="month-selector-card">
               {" "}
        <label htmlFor="month" className="month-selector-label">
                    Select Month:        {" "}
        </label>
               {" "}
        <input
          id="month"
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="month-selector-input"
        />
             {" "}
      </div>
            {/* Status Messages */}     {" "}
      {message && (
        <div className="status-message success-message">
                    {message}       {" "}
        </div>
      )}
           {" "}
      {error && (
        <div className="status-message error-message">
                    {error}       {" "}
        </div>
      )}
            {/* Budget Table */}     {" "}
      <div className="budget-table-card">
               {" "}
        <div className="budget-table-header">
                    <span>Category</span>          <span>Budgeted Amount</span> 
               {" "}
        </div>
               {" "}
        <ul className="budget-list">
                   {" "}
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id} className="budget-list-item">
                               {" "}
                <span className="category-name">
                                    {category.name}               {" "}
                </span>
                               {" "}
                <div className="budget-input-group">
                                    <span className="currency-symbol">$</span> 
                                 {" "}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={budgetsMap[category.id] || ""}
                    onChange={(e) =>
                      handleBudgetChange(category.id, e.target.value)
                    }
                    className="budget-input"
                  />
                                 {" "}
                </div>
                             {" "}
              </li>
            ))
          ) : (
            <div className="no-data-message">
                            No categories found. Please add categories before
              setting budgets.            {" "}
            </div>
          )}
                 {" "}
        </ul>
             {" "}
      </div>
            {/* Save Button */}     {" "}
      <div className="save-button-container">
               {" "}
        <button
          onClick={handleSaveAll}
          disabled={saving || categories.length === 0}
          className="save-button success-button"
        >
                    <FaSave className="icon-left" />         {" "}
          {saving ? "Saving..." : `Save All Budgets for ${selectedMonth}`}     
           {" "}
        </button>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default BudgetsPage;
