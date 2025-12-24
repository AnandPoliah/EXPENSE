const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");

// FR3.1, FR3.3: Create/Update budget
router.post("/", budgetController.setBudget);

// FR3.3: Get budgets for a month
router.get("/", budgetController.getBudgets);

module.exports = router;
