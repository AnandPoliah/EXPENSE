const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// FR2.1: Create
router.post("/", transactionController.createTransaction);

// FR5.1: Read all (will include filtering later)
router.get("/", transactionController.getTransactions);

// FR2.2: Update and Delete
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
