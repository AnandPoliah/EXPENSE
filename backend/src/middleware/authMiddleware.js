const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token or improperly formatted header
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // Extract the token part
  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach the userId to the request object (crucial for data filtering)
    // The payload we created in authController had { userId: id }
    req.userId = decoded.userId;

    // 4. Proceed to the next middleware/controller
    next();
  } catch (ex) {
    // Token is invalid (e.g., expired, modified, or wrong secret)
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
