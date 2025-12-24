const express = require("express");
const router = express.Router();

// --- TEMPORARY ROUTE HANDLERS ---

// POST /api/v1/categories
router.post("/", (req, res) => {
  // Standard response structure should be the created resource
  res.status(201).json({
    message: "Category POST route operational (TEMP)",
    // Placeholder data format (assuming MongoDB structure with _id)
    data: { _id: "temp_id_123", name: req.body.name || "New Category" },
  });
});

// GET /api/v1/categories
router.get("/", (req, res) => {
  // ⭐ CRITICAL FIX: The frontend expects an ARRAY for .map() to work.
  const tempCategories = [
    { _id: "cat_id_1", name: "Salary", type: "income" },
    { _id: "cat_id_2", name: "Groceries", type: "expense" },
    { _id: "cat_id_3", name: "Rent", type: "expense" },
  ];

  // Send back a structure that resembles a list of categories
  res.status(200).json(tempCategories);
});

// PUT /api/v1/categories/:id
router.put("/:id", (req, res) => {
  // Standard response structure should be the updated resource
  res.status(200).json({
    message: `Category PUT route operational for ID: ${req.params.id} (TEMP)`,
    data: { _id: req.params.id, name: req.body.name || "Updated Category" },
  });
});

// DELETE /api/v1/categories/:id
router.delete("/:id", (req, res) => {
  // Standard response structure for successful deletion
  res.status(204).send(); // 204 No Content is standard for successful DELETE
});

// CRUCIAL FIX: Export the router FUNCTION
module.exports = router;
