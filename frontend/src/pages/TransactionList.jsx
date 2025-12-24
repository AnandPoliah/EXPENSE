// frontend/src/pages/TransactionList.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaEdit, FaFilter, FaFileCsv, FaTimes } from "react-icons/fa";
import "./TransactionList.css"; // ⭐ CSS Import

// Format number to currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};
  
// Helper to format date for display
const formatDateDisplay = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString() : "";
};

const TransactionList = () => {
  const { apiClient } = useAuth(); // State for transactions and loading

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Filter State (FR5.1)

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "", // 'Expense', 'Income', or '' for All
    categoryId: "",
  });

  const [showFilters, setShowFilters] = useState(false); // --- Data Fetching Logic --- // 1. Fetch Categories (Required for filter dropdown)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, [apiClient]); // 2. Fetch Transactions (Called whenever filters change)

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from filters
      const params = new URLSearchParams(filters).toString(); // Assume the backend handles these query parameters for filtering (FR5.1)

      const response = await apiClient.get(`/transactions?${params}`);
      setTransactions(response.data);
    } catch (err) {
      setError("Failed to fetch transactions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // --- Handlers ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      type: "",
      categoryId: "",
    });
  }; // FR5.2: Export to CSV Placeholder

  const handleExportCsv = () => {
    // In a real application, a dedicated backend endpoint would generate and return the CSV.
    alert(
      `Exporting ${transactions.length} transactions with current filters to CSV! (Feature placeholder)`
    );
  }; // --- Totals Calculation (FR5.1) ---

  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach((t) => {
      const amount = parseFloat(t.amount);
      if (t.type === "Income") {
        income += amount;
      } else {
        expenses += amount;
      }
    });
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
    };
  }, [transactions]); // --- Render Logic ---

  if (loading) {
    return <div className="loading-message">Loading transactions...</div>;
  }

  return (
    <div className="transaction-list-container">
           {" "}
      <header className="list-header">
               {" "}
        <h1 className="page-title">          Transaction History         </h1> 
             {" "}
        <Link
          to="/transaction/add"
          className="add-transaction-button primary-button"
        >
                    <FaEdit />          <span>New Transaction</span>       {" "}
        </Link>
             {" "}
      </header>
            {/* Filter Controls (FR5.1) */}     {" "}
      <div className="filter-controls-card">
               {" "}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle-button"
        >
                    <FaFilter className="icon-left" />         {" "}
          {showFilters ? "Hide Filters" : "Show Filters"}       {" "}
        </button>
               {" "}
        {showFilters && (
          <div className="filter-grid">
                        {/* Date Range Filters */}           {" "}
            <div className="filter-group">
                           {" "}
              <label className="filter-label">
                                Start Date              {" "}
              </label>
                           {" "}
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
                         {" "}
            </div>
                       {" "}
            <div className="filter-group">
                           {" "}
              <label className="filter-label">
                                End Date              {" "}
              </label>
                           {" "}
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
                         {" "}
            </div>
                        {/* Type Filter */}           {" "}
            <div className="filter-group">
                           {" "}
              <label className="filter-label">
                                Type              {" "}
              </label>
                           {" "}
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="filter-select"
              >
                                <option value="">All Types</option>             
                  <option value="Expense">Expense</option>               {" "}
                <option value="Income">Income</option>             {" "}
              </select>
                         {" "}
            </div>
                        {/* Category Filter */}           {" "}
            <div className="filter-group">
                           {" "}
              <label className="filter-label">
                                Category              {" "}
              </label>
                           {" "}
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="filter-select"
              >
                                <option value="">All Categories</option>       
                       {" "}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                                        {cat.name}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                        {/* Actions */}           {" "}
            <div className="filter-actions">
                           {" "}
              <button
                onClick={handleResetFilters}
                className="filter-button reset-button"
              >
                                <FaTimes className="icon-left" /> Reset        
                     {" "}
              </button>
                           {" "}
              <button
                onClick={handleExportCsv}
                className="filter-button export-button"
              >
                                <FaFileCsv className="icon-left" /> Export CSV
                (FR5.2)              {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {/* Totals Summary */}     {" "}
      <div className="totals-summary-grid">
               {" "}
        <div className="summary-box income-box">
                    <p className="summary-label">Total Income</p>         {" "}
          <p className="summary-value income-value">
                        {formatCurrency(totalIncome)}         {" "}
          </p>
                 {" "}
        </div>
               {" "}
        <div className="summary-box expense-box">
                    <p className="summary-label">Total Expenses</p>         {" "}
          <p className="summary-value expense-value">
                        {formatCurrency(totalExpenses)}         {" "}
          </p>
                 {" "}
        </div>
               {" "}
        <div className="summary-box balance-box">
                    <p className="summary-label">Net Balance</p>         {" "}
          <p className="summary-value balance-value">
                        {formatCurrency(netBalance)}         {" "}
          </p>
                 {" "}
        </div>
             {" "}
      </div>
            {/* Transaction Table */}     {" "}
      <div className="transaction-table-card">
               {" "}
        {transactions.length > 0 ? (
          <div className="table-responsive">
                       {" "}
            <table className="transaction-table">
                           {" "}
              <thead className="table-header-group">
                               {" "}
                <tr>
                                   {" "}
                  <th className="table-header date-col">
                                        Date                  {" "}
                  </th>
                                   {" "}
                  <th className="table-header description-col">
                                        Description                  {" "}
                  </th>
                                   {" "}
                  <th className="table-header category-col">
                                        Category                  {" "}
                  </th>
                                   {" "}
                  <th className="table-header type-col">
                                        Type                  {" "}
                  </th>
                                   {" "}
                  <th className="table-header amount-col text-right">
                                        Amount                  {" "}
                  </th>
                                   {" "}
                  <th className="table-header actions-col"></th>               {" "}
                </tr>
                             {" "}
              </thead>
                           {" "}
              <tbody className="table-body">
                               {" "}
                {transactions.map((t) => (
                  <tr key={t.id} className="table-row">
                                       {" "}
                    <td className="table-cell date-col">
                                            {formatDateDisplay(t.date)}         
                               {" "}
                    </td>
                                       {" "}
                    <td className="table-cell description-col">
                                            {t.description || "-"}             
                           {" "}
                    </td>
                                       {" "}
                    <td className="table-cell category-col">
                                            {t.category_name || "-"}           
                             {" "}
                    </td>
                                       {" "}
                    <td
                      className={`table-cell type-col ${
                        t.type === "Income" ? "text-income" : "text-expense"
                      }`}
                    >
                                            {t.type}                   {" "}
                    </td>
                                       {" "}
                    <td
                      className={`table-cell amount-col text-right font-bold ${
                        t.type === "Income" ? "text-income" : "text-expense"
                      }`}
                    >
                                            {formatCurrency(t.amount)}         
                               {" "}
                    </td>
                                       {" "}
                    <td className="table-cell actions-col">
                                           {" "}
                      <Link
                        to={`/transaction/edit/${t.id}`}
                        className="edit-link"
                      >
                                                <FaEdit />                     {" "}
                      </Link>
                                         {" "}
                    </td>
                                     {" "}
                  </tr>
                ))}
                             {" "}
              </tbody>
                         {" "}
            </table>
                     {" "}
          </div>
        ) : (
          <div className="no-transactions-message">
                       {" "}
            {error || "No transactions found matching the current filters."}   
                 {" "}
          </div>
        )}
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default TransactionList;
