const analyticsService = require("../services/analyticsService");

// Helper to get month from query params or default to current month
const getMonthParam = (req) =>
  req.query.month || new Date().toISOString().substring(0, 7);

// GET /api/v1/analytics/summary (FR4.1)
exports.getSummary = async (req, res) => {
  try {
    const summary = await analyticsService.getMonthlySummary(
      req.userId,
      getMonthParam(req)
    );
    res.status(200).json(summary);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching summary.", error: error.message });
  }
};

// GET /api/v1/analytics/breakdown (FR4.2)
exports.getBreakdown = async (req, res) => {
  try {
    const breakdown = await analyticsService.getCategoryBreakdown(
      req.userId,
      getMonthParam(req)
    );
    res.status(200).json(breakdown);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching breakdown.", error: error.message });
  }
};

// GET /api/v1/analytics/trend (FR4.3)
exports.getTrend = async (req, res) => {
  try {
    const trend = await analyticsService.getDailySpendingTrend(req.userId);
    res.status(200).json(trend);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching trend.", error: error.message });
  }
};

// GET /api/v1/analytics/budget-health (FR4.4, FR3.2)
exports.getBudgetHealth = async (req, res) => {
  try {
    const healthData = await analyticsService.getBudgetHealth(
      req.userId,
      getMonthParam(req)
    );
    res.status(200).json(healthData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching budget health.", error: error.message });
  }
};
