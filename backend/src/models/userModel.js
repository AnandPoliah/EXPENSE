const db = require("../config/db");

// Function to find a user by email for login/registration validation
const findByEmail = async (email) => {
  const res = await db.query(
    'SELECT id, email, password_hash FROM "User" WHERE email = $1',
    [email]
  );
  return res.rows[0];
};

// Function to create a new user (used during registration)
const create = async (name, email, passwordHash) => {
  const res = await db.query(
    'INSERT INTO "User" (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
    [name, email, passwordHash]
  );
  return res.rows[0];
};

module.exports = {
  findByEmail,
  create,
};
