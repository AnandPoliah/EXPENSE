// frontend/src/pages/TransactionForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./TransactionForm.css";

// Define initial state for the form data
const initialFormState = {
  type: "expense", // 'expense' or 'income'
  amount: "",
  description: "",
  date: new Date().toISOString().substring(0, 10), // YYYY-MM-DD
  category: "", // ID of the category
  account: "", // ID of the account
};

const TransactionForm = () => {
  const { id } = useParams(); // For edit mode (transaction ID)
  const navigate = useNavigate();
  const { apiClient } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX: Initialize categories and accounts as empty arrays. (This was mostly right, but the fetch logic was flawed.)
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // --- Data Fetching Effect (Categories, Accounts, and Existing Transaction for Edit) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoints = [
          apiClient.get("/categories"),
          apiClient.get("/accounts"),
        ];

        if (isEditMode) {
          endpoints.push(apiClient.get(`/transactions/${id}`));
        }

        // Use Promise.allSettled to handle individual failures gracefully
        // without crashing the entire component and ensuring all states are set.
        const results = await Promise.allSettled(endpoints);

        const categoriesResult = results[0];
        const accountsResult = results[1];

        // 1. Process Categories
        // Check if the request succeeded and set the state, otherwise set to empty array.
        if (
          categoriesResult.status === "fulfilled" &&
          categoriesResult.value.data
        ) {
          setCategories(categoriesResult.value.data);
          // Set default value
          setFormData((prev) => ({
            ...prev,
            category: prev.category || categoriesResult.value.data[0]?._id,
          }));
        } else {
          // If categories fetch fails, log the error and ensure state is an array.
          console.error("Failed to fetch categories:", categoriesResult.reason);
          setCategories([]);
          setError((prev) =>
            prev ? prev + " | Categories failed." : "Categories failed."
          );
        }

        // 2. Process Accounts
        if (
          accountsResult.status === "fulfilled" &&
          accountsResult.value.data
        ) {
          setAccounts(accountsResult.value.data);
          // Set default value
          setFormData((prev) => ({
            ...prev,
            account: prev.account || accountsResult.value.data[0]?._id,
          }));
        } else {
          console.error("Failed to fetch accounts:", accountsResult.reason);
          setAccounts([]);
          // Explicitly set an error message since this is the 404
          setError((prev) =>
            prev
              ? prev + " | Accounts failed (Check backend routes for 404)."
              : "Accounts failed (Check backend routes for 404)."
          );
        }

        // 3. Process Existing Transaction Data (if in edit mode)
        if (isEditMode) {
          const transactionResult = results[2];
          if (
            transactionResult.status === "fulfilled" &&
            transactionResult.value.data
          ) {
            const transactionData = transactionResult.value.data;
            setFormData({
              type: transactionData.type,
              amount: transactionData.amount,
              description: transactionData.description,
              date: new Date(transactionData.date)
                .toISOString()
                .substring(0, 10),
              category: transactionData.category._id,
              account: transactionData.account._id,
            });
          }
        }
      } catch (err) {
        // This catch block will only hit if Promise.allSettled fails itself (rarely).
        console.error("Unhandled error in form fetch:", err);
        setError("An unexpected error occurred during form data loading.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiClient, id, isEditMode]);

  // --- Handlers (Unchanged from previous version) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || value : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.amount || !formData.category || !formData.account) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode) {
        await apiClient.put(`/transactions/${id}`, formData);
      } else {
        await apiClient.post("/transactions", formData);
      }

      navigate("/transactions");
    } catch (err) {
      console.error("Transaction submission failed:", err);
      setError(
        `Submission Failed: ${err.response?.data?.message || "Server error."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  if (loading) {
    return <div className="loading-message">Loading form data...</div>;
  }

  // Display specific errors for debugging if data couldn't be loaded
  if (error && (categories.length === 0 || accounts.length === 0)) {
    return (
      <div className="error-box">
        Critical Error: {error}. Cannot proceed without categories/accounts.
      </div>
    );
  }

  return (
    <div className="transaction-form-container">
      <h1>{isEditMode ? "Edit Transaction" : "Quick-Add Transaction"}</h1>

      <form onSubmit={handleSubmit} className="transaction-form">
        {/* Transaction Type Selector (Income/Expense) */}
        <div className="form-group type-group">
          <label>Type</label>
          <div className="type-radios">
            <label className={formData.type === "expense" ? "active-type" : ""}>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === "expense"}
                onChange={handleChange}
              />
              Expense
            </label>
            <label className={formData.type === "income" ? "active-type" : ""}>
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === "income"}
                onChange={handleChange}
              />
              Income
            </label>
          </div>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category Selector */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {/* Safe rendering check */}
            {categories.length === 0 && (
              <option value="">No categories available</option>
            )}
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Selector */}
        <div className="form-group">
          <label htmlFor="account">Account</label>
          <select
            id="account"
            name="account"
            value={formData.account}
            onChange={handleChange}
            required
          >
            {/* Safe rendering check */}
            {accounts.length === 0 && (
              <option value="">No accounts available</option>
            )}
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Transaction"
            : "Add Transaction"}
        </button>
        {error && <p className="submission-error">{error}</p>}
      </form>
    </div>
  );
};

export default TransactionForm;
