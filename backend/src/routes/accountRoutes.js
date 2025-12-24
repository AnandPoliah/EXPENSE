// C:\reactworkplace\Expense\backend\src\routes\accountRoutes.js

const express = require("express");
const router = express.Router();

// GET /api/v1/accounts - Must return an array for the frontend select list
router.get("/", (req, res) => {
  const tempAccounts = [
    { _id: "acc_id_1", name: "Main Checking" },
    { _id: "acc_id_2", name: "Savings Fund" },
  ];
  res.status(200).json(tempAccounts);
});

// POST /api/v1/accounts
router.post("/", (req, res) => {
  res.status(201).json({
    message: "Account POST operational (TEMP)",
    data: { _id: "temp_acc_id_new", name: req.body.name || "New Account" },
  });
});

module.exports = router;
