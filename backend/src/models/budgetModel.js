const db = require("../config/db");

// FR3.1: Create or Update a monthly budget for a specific category.
// We use INSERT...ON CONFLICT to handle both creation and updates efficiently.
const upsert = async (userId, categoryId, monthYear, amount) => {
  // Note: The unique constraint is on (user_id, category_id, month_year)
  const res = await db.query(
    `INSERT INTO Budget (user_id, category_id, month_year, amount) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, category_id, month_year)
         DO UPDATE SET amount = EXCLUDED.amount, created_at = CURRENT_TIMESTAMP
         RETURNING id, category_id, month_year, amount`,
    [userId, categoryId, monthYear, amount]
  );
  return res.rows[0];
};

// FR3.3: Retrieve all budgets for a specific user and month.
const findAllByMonth = async (userId, monthYear) => {
  const res = await db.query(
    `SELECT 
            b.id, b.category_id, b.amount as budgeted_amount,
            c.name as category_name
         FROM Budget b
         JOIN Category c ON b.category_id = c.id
         WHERE b.user_id = $1 AND b.month_year = $2`,
    [userId, monthYear]
  );
  return res.rows;
};

// We will add more complex logic (tracking spent, remaining) in the AnalyticsService later (Phase 3).

module.exports = {
  upsert,
  findAllByMonth,
};
