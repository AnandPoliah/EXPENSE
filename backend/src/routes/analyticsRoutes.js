const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// FR4: Dashboard Endpoints
router.get("/summary", analyticsController.getSummary);
router.get("/breakdown", analyticsController.getBreakdown);
router.get("/trend", analyticsController.getTrend);
router.get("/budget-health", analyticsController.getBudgetHealth);

module.exports = router;
