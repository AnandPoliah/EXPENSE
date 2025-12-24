const transactionModel = require("../models/transactionModel");

// Shared validation logic for amount, type, and category ownership
const validateTransactionData = async (userId, data) => {
  const { amount, type, categoryId } = data;

  // FR2.3: System validates amount > 0
  if (typeof amount !== "number" || amount <= 0) {
    return { valid: false, message: "Amount must be a positive number." };
  }

  // Validate transaction type
  if (!["Expense", "Income"].includes(type)) {
    return { valid: false, message: 'Type must be "Expense" or "Income".' };
  }

  // Check if category exists and belongs to the user
  if (categoryId) {
    const isOwner = await transactionModel.checkCategoryOwnership(
      categoryId,
      userId
    );
    if (!isOwner) {
      return { valid: false, message: "Category not found or invalid." };
    }
  }

  // Ensure categoryId is NULL if type is Income, or validate it for Expense (optional rule)
  // For simplicity, we allow categories on Income, but validation ensures its existence.

  return { valid: true };
};

exports.createTransaction = async (userId, data) => {
  const validation = await validateTransactionData(userId, data);
  if (!validation.valid) throw new Error(validation.message);

  const { categoryId, type, amount, description, date } = data;

  return transactionModel.create(
    userId,
    categoryId,
    type,
    amount,
    description,
    date
  );
};

exports.updateTransaction = async (id, userId, data) => {
  const validation = await validateTransactionData(userId, data);
  if (!validation.valid) throw new Error(validation.message);

  const { categoryId, type, amount, description, date } = data;

  const updatedTransaction = await transactionModel.update(
    id,
    userId,
    categoryId,
    type,
    amount,
    description,
    date
  );
  if (!updatedTransaction) {
    throw new Error("Transaction not found or does not belong to user.");
  }
  return updatedTransaction;
};

exports.deleteTransaction = async (id, userId) => {
  const deleted = await transactionModel.remove(id, userId);
  if (!deleted) {
    throw new Error("Transaction not found or does not belong to user.");
  }
  return true;
};

exports.getTransactions = (userId) => {
  // FR5.1 logic will be added here later
  return transactionModel.findAllByUserId(userId);
};
