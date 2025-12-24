// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  // Default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific types of errors, e.g., PostgreSQL errors
  if (err.code === "23502") {
    // Not null violation
    statusCode = 400;
    message = "Missing required field.";
  }

  res.status(statusCode).json({
    status: "error",
    message: message,
  });
};

module.exports = errorHandler;
