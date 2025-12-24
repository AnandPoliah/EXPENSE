const budgetModel = require("../models/budgetModel");
const transactionModel = require("../models/transactionModel"); // Used for category check

// Helper to validate YYYY-MM format
const isValidMonthYear = (monthYear) => {
  return /^\d{4}-\d{2}$/.test(monthYear);
};

exports.setBudget = async (userId, categoryId, monthYear, amount) => {
  // Basic Validation
  if (!isValidMonthYear(monthYear)) {
    throw new Error("Invalid month format. Must be YYYY-MM.");
  }
  if (typeof amount !== "number" || amount < 0) {
    throw new Error("Budget amount must be a non-negative number.");
  }

  // Security check: Ensure category exists and belongs to the user
  const isOwner = await transactionModel.checkCategoryOwnership(
    categoryId,
    userId
  );
  if (!isOwner) {
    throw new Error("Category not found or invalid.");
  }

  return budgetModel.upsert(userId, categoryId, monthYear, amount);
};

exports.getBudgetsByMonth = async (userId, monthYear) => {
  if (!isValidMonthYear(monthYear)) {
    throw new Error("Invalid month format. Must be YYYY-MM.");
  }
  return budgetModel.findAllByMonth(userId, monthYear);
};
