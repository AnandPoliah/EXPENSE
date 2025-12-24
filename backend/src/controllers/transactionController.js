// C:\reactworkplace\Expense\backend\src\controllers\transactionController.js

const transactionService = require("../services/transactionService");
// NOTE: This controller assumes authentication middleware has run and set req.userId

// POST /api/v1/transactions (FR2.1)
exports.createTransaction = async (req, res) => {
  // 1. CRITICAL FIX: Explicitly check for user ID to prevent 500 crash on auth failure
  if (!req.userId) {
    return res.status(401).json({
      message: "Authentication required to create transaction.",
    });
  }

  try {
    const transaction = await transactionService.createTransaction(
      req.userId,
      req.body
    );
    res.status(201).json(transaction);
  } catch (error) {
    // Log the error for backend debugging
    console.error("Error in createTransaction:", error);

    if (error.message.includes("Amount must be a positive number")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error creating transaction.", error: error.message });
  }
};

// PUT /api/v1/transactions/:id (FR2.2)
exports.updateTransaction = async (req, res) => {
  if (!req.userId) {
    return res
      .status(401)
      .json({ message: "Authentication required to update transaction." });
  }

  try {
    const updatedTransaction = await transactionService.updateTransaction(
      req.params.id,
      req.userId,
      req.body
    );
    res.status(200).json(updatedTransaction);
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("Amount must be a positive number")
    ) {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error updating transaction.", error: error.message });
  }
};

// DELETE /api/v1/transactions/:id (FR2.2)
exports.deleteTransaction = async (req, res) => {
  if (!req.userId) {
    return res
      .status(401)
      .json({ message: "Authentication required to delete transaction." });
  }

  try {
    await transactionService.deleteTransaction(req.params.id, req.userId);
    res.status(204).send();
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error deleting transaction.", error: error.message });
  }
};

// GET /api/v1/transactions (FR5.1 - Initial Read)
exports.getTransactions = async (req, res) => {
  if (!req.userId) {
    return res
      .status(401)
      .json({ message: "Authentication required to fetch transactions." });
  }

  try {
    // Full filtering logic will replace this basic call in Step 15
    const transactions = await transactionService.getTransactions(req.userId);
    res.status(200).json(transactions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transactions.", error: error.message });
  }
};
