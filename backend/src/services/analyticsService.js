const db = require("../config/db");

// Helper to get YYYY-MM string for the current month
const getCurrentMonthYear = () => {
  return new Date().toISOString().substring(0, 7);
};

// FR4.1: Monthly Summary (Total Income, Total Expenses, Net Balance)
exports.getMonthlySummary = async (
  userId,
  monthYear = getCurrentMonthYear()
) => {
  // We filter all transactions for the given month (YYYY-MM-DD)
  const [year, month] = monthYear.split("-");

  // SQL uses conditional aggregation (CASE WHEN) to sum Income and Expense separately
  const res = await db.query(
    `SELECT
            COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS total_expenses
         FROM Transaction
         WHERE user_id = $1
         AND EXTRACT(YEAR FROM date) = $2
         AND EXTRACT(MONTH FROM date) = $3`,
    [userId, year, month]
  );

  const data = res.rows[0] || { total_income: 0, total_expenses: 0 };

  // Calculate Net Balance (FR4.1)
  data.net_balance = data.total_income - data.total_expenses;

  return data;
};

// FR4.2: Category-wise Expense Breakdown
exports.getCategoryBreakdown = async (
  userId,
  monthYear = getCurrentMonthYear()
) => {
  const [year, month] = monthYear.split("-");

  const res = await db.query(
    `SELECT
            c.name AS category_name,
            COALESCE(SUM(t.amount), 0) AS total_spent
         FROM Transaction t
         JOIN Category c ON t.category_id = c.id
         WHERE t.user_id = $1
         AND t.type = 'Expense'
         AND EXTRACT(YEAR FROM t.date) = $2
         AND EXTRACT(MONTH FROM t.date) = $3
         GROUP BY c.name
         ORDER BY total_spent DESC`,
    [userId, year, month]
  );

  return res.rows;
};

// FR4.3: Spending Trendline (Daily Spending over last 30 days)
exports.getDailySpendingTrend = async (userId, days = 30) => {
  const res = await db.query(
    `SELECT
            TO_CHAR(date, 'YYYY-MM-DD') AS date_label,
            COALESCE(SUM(amount), 0) AS daily_spent
         FROM Transaction
         WHERE user_id = $1
         AND type = 'Expense'
         AND date >= CURRENT_DATE - INTERVAL '$2 day'
         GROUP BY date
         ORDER BY date ASC`,
    [userId, days]
  );
  return res.rows;
};

// FR4.4 & FR3.2: Budget Health (Spent vs. Budgeted)
exports.getBudgetHealth = async (userId, monthYear = getCurrentMonthYear()) => {
  // 1. Get total spent per category for the month
  const spentRes = await db.query(
    `SELECT
            c.id AS category_id,
            c.name AS category_name,
            COALESCE(SUM(t.amount), 0) AS total_spent
         FROM Category c
         LEFT JOIN Transaction t 
            ON c.id = t.category_id 
            AND t.user_id = $1
            AND t.type = 'Expense'
            AND TO_CHAR(t.date, 'YYYY-MM') = $2
         WHERE c.user_id = $1
         GROUP BY c.id, c.name`,
    [userId, monthYear]
  );

  // 2. Get budgeted amount for each category for the month
  const budgetRes = await db.query(
    `SELECT
            category_id,
            amount AS budgeted_amount
         FROM Budget
         WHERE user_id = $1 AND month_year = $2`,
    [userId, monthYear]
  );

  const budgetedMap = budgetRes.rows.reduce((map, item) => {
    map[item.category_id] = parseFloat(item.budgeted_amount);
    return map;
  }, {});

  // 3. Combine results to calculate remaining/over-budget status (FR3.2)
  return spentRes.rows.map((item) => {
    const spent = parseFloat(item.total_spent);
    const budgeted = budgetedMap[item.category_id] || 0; // Default budget to 0 if not set

    return {
      categoryId: item.category_id,
      categoryName: item.category_name,
      totalSpent: spent,
      budgetedAmount: budgeted,
      remaining: budgeted - spent,
      isOverBudget: budgeted > 0 && spent > budgeted, // FR4.4 logic
    };
  });
};
