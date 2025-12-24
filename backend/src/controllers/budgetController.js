const budgetService = require("../services/budgetService");

// POST /api/v1/budgets (FR3.1)
exports.setBudget = async (req, res) => {
  const userId = req.userId;
  const { categoryId, monthYear, amount } = req.body;

  try {
    const budget = await budgetService.setBudget(
      userId,
      categoryId,
      monthYear,
      amount
    );
    res.status(200).json(budget); // Returns 200 for upsert/update success
  } catch (error) {
    if (
      error.message.includes("Invalid month format") ||
      error.message.includes("Budget amount") ||
      error.message.includes("Category not found")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error setting budget:", error);
    res.status(500).json({ message: "Server error setting budget." });
  }
};

// GET /api/v1/budgets?month=YYYY-MM (FR3.3)
exports.getBudgets = async (req, res) => {
  const userId = req.userId;
  // Default to current month if not provided
  const monthYear = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const budgets = await budgetService.getBudgetsByMonth(userId, monthYear);
    res.status(200).json(budgets);
  } catch (error) {
    if (error.message.includes("Invalid month format")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error fetching budgets." });
  }
};
