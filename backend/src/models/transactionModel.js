const db = require("../config/db");

// FR2.1: Create a new transaction
const create = async (userId, categoryId, type, amount, description, date) => {
  const res = await db.query(
    `INSERT INTO Transaction 
         (user_id, category_id, type, amount, description, date) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, type, amount, description, date, category_id`,
    [userId, categoryId, type, amount, description, date]
  );
  return res.rows[0];
};

// FR2.2: Update an existing transaction
const update = async (
  id,
  userId,
  categoryId,
  type,
  amount,
  description,
  date
) => {
  const res = await db.query(
    `UPDATE Transaction SET 
         category_id = $1, type = $2, amount = $3, description = $4, date = $5 
         WHERE id = $6 AND user_id = $7 
         RETURNING id, type, amount, description, date, category_id`,
    [categoryId, type, amount, description, date, id, userId]
  );
  return res.rows[0];
};

// FR2.2: Delete an existing transaction
const remove = async (id, userId) => {
  const res = await db.query(
    "DELETE FROM Transaction WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return res.rows.length > 0;
};

// FR5.1: Retrieve all transactions (basic read without filtering for now)
const findAllByUserId = async (userId) => {
  const res = await db.query(
    `SELECT 
            t.id, t.type, t.amount, t.description, t.date, t.category_id,
            c.name as category_name
         FROM Transaction t
         LEFT JOIN Category c ON t.category_id = c.id
         WHERE t.user_id = $1
         ORDER BY t.date DESC, t.id DESC`,
    [userId]
  );
  return res.rows;
};

// Function to check if a category belongs to a user (security check)
const checkCategoryOwnership = async (categoryId, userId) => {
  const res = await db.query(
    "SELECT 1 FROM Category WHERE id = $1 AND user_id = $2",
    [categoryId, userId]
  );
  return res.rows.length > 0;
};

module.exports = {
  create,
  update,
  remove,
  findAllByUserId,
  checkCategoryOwnership,
};
