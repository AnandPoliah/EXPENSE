const db = require("../config/db");

// FR2.4: Create a new category for a specific user
const create = async (userId, name) => {
  // Note: The uniqueness constraint on (user_id, name) is handled by PostgreSQL
  const res = await db.query(
    "INSERT INTO Category (user_id, name) VALUES ($1, $2) RETURNING id, name",
    [userId, name]
  );
  return res.rows[0];
};

// FR2.4: Retrieve all categories for a specific user
const findAllByUserId = async (userId) => {
  const res = await db.query(
    "SELECT id, name FROM Category WHERE user_id = $1 ORDER BY name ASC",
    [userId]
  );
  return res.rows;
};

// Simple update function
const update = async (id, userId, name) => {
  const res = await db.query(
    "UPDATE Category SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name",
    [name, id, userId]
  );
  return res.rows[0];
};

// Simple delete function
const remove = async (id, userId) => {
  // PostgreSQL CASCADE rules will handle dependent budgets/transactions if you implement ON DELETE CASCADE
  const res = await db.query(
    "DELETE FROM Category WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return res.rows.length > 0;
};

module.exports = {
  create,
  findAllByUserId,
  update,
  remove,
};
