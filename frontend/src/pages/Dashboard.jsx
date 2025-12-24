// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Dashboard.css";

// --- Placeholder Components ---
const ChartPlaceholder = ({ title }) => (
  <div className="chart-placeholder-area">
    <p className="chart-placeholder-text">{title} Chart Area</p>
  </div>
);
// --------------------------------------------------------------------------

// Format number to currency
const formatCurrency = (amount) => {
  const numericAmount = parseFloat(amount) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numericAmount);
};

// Define initial state for safety
const initialSummary = {
  total_income: 0,
  total_expenses: 0,
  net_balance: 0,
};

const Dashboard = () => {
  const { apiClient } = useAuth();
  const [summary, setSummary] = useState(initialSummary);
  const [budgetHealth, setBudgetHealth] = useState([]);

  // Removed trend and breakdown state for simplicity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch only the summary and budget health data for initial stability
        const endpoints = [
          apiClient.get("/analytics/summary"),
          apiClient.get("/analytics/budget-health"),
        ];

        const [summaryRes, healthRes] = await Promise.all(endpoints);

        setSummary(summaryRes.data);
        setBudgetHealth(healthRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);

        // Improve error message based on the status code
        const errorMessage =
          err.response?.status === 500
            ? "An internal server error occurred. Check the backend server terminal."
            : "Failed to load financial data. Please try again.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiClient]);

  const overBudgetItems = useMemo(() => {
    return budgetHealth.filter((item) => item.isOverBudget);
  }, [budgetHealth]);

  if (loading) {
    return (
      <div className="loading-message">Loading financial dashboards...</div>
    );
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Header with Quick Add Button (FIXED ALIGNMENT) */}
      <header className="dashboard-header">
        <h1 className="page-title">Monthly Financial Overview</h1>
        <Link to="/transaction/add" className="quick-add-button primary-button">
          <FaPlus />
          <span>Quick-Add Transaction</span>
        </Link>
      </header>

      {/* I. Monthly Summary (FR4.1) */}
      <div className="summary-grid">
        {/* Total Income */}
        <div className="dashboard-card income-card">
          <p className="card-label">
            <FaArrowUp className="icon-income" /> TOTAL INCOME
          </p>
          <p className="card-value income-value">
            {formatCurrency(summary.total_income)}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="dashboard-card expense-card">
          <p className="card-label">
            <FaArrowDown className="icon-expense" /> TOTAL EXPENSES
          </p>
          <p className="card-value expense-value">
            {formatCurrency(summary.total_expenses)}
          </p>
        </div>

        {/* Net Balance */}
        <div className="dashboard-card balance-card">
          <p className="card-label">
            <FaBalanceScale className="icon-balance" /> NET BALANCE
          </p>
          <p
            className={`card-value ${
              summary.net_balance >= 0 ? "income-value" : "expense-value"
            }`}
          >
            {formatCurrency(summary.net_balance)}
          </p>
        </div>
      </div>

      <h2 className="section-title">Spending Visuals (Placeholders)</h2>

      {/* II. Spending Visuals (Placeholders for FR4.2 & FR4.3) */}
      <div className="visuals-grid">
        {/* Category Breakdown Placeholder (FR4.2) */}
        <div className="dashboard-card chart-card">
          <h3 className="card-subtitle">Category Breakdown (Expenses)</h3>
          <ChartPlaceholder title="Category Breakdown" />

          <div className="chart-legend">
            <p className="legend-item">Legend data will show here.</p>
          </div>
        </div>

        {/* Daily Spending Trend Placeholder (FR4.3) */}
        <div className="dashboard-card chart-card">
          <h3 className="card-subtitle">Spending Trend (Last 30 Days)</h3>
          <ChartPlaceholder title="Daily Trend" />
        </div>
      </div>

      {/* III. Budget Health & IV. Recent Activity */}
      <div className="detail-grid">
        {/* Budget Health (FR4.4) */}
        <div className="dashboard-card health-card">
          <h3 className="card-subtitle health-title">
            <FaExclamationTriangle className="icon-alert" /> Over-Budget Alerts
          </h3>
          {overBudgetItems.length > 0 ? (
            <ul className="alert-list">
              {overBudgetItems.map((item) => (
                <li
                  key={item.categoryId}
                  className="alert-item over-budget-item"
                >
                  <p className="alert-category-name">{item.categoryName}</p>
                  <p className="alert-spent-info">
                    Spent: {formatCurrency(item.totalSpent)} | Budget:{" "}
                    {formatCurrency(item.budgetedAmount)}
                  </p>
                  <p className="alert-over-amount">
                    Over:{" "}
                    {formatCurrency(item.totalSpent - item.budgetedAmount)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="alert-item budget-ok-item">
              <p className="budget-ok-text">
                All budgets are currently under control!
              </p>
            </div>
          )}
          <Link to="/budgets" className="view-link">
            View and Edit All Budgets →
          </Link>
        </div>

        {/* Recent Activity (FR5.1 - Simplified Static Data) */}
        <div className="dashboard-card activity-card">
          <h3 className="card-subtitle">Recent Transactions</h3>
          <ul className="recent-activity-list">
            <li className="activity-item expense-item">
              <span>Oct 15 - Rent Payment</span>
              <span className="activity-amount expense-amount">-$1,500.00</span>
            </li>
            <li className="activity-item income-item">
              <span>Oct 14 - Salary Deposit</span>
              <span className="activity-amount income-amount">+$4,000.00</span>
            </li>
            <li className="activity-item expense-item">
              <span>Oct 13 - Groceries</span>
              <span className="activity-amount expense-amount">-$125.50</span>
            </li>
          </ul>
          <Link to="/transactions" className="view-link">
            View All Transactions →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
