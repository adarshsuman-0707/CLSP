const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import user model

const authMiddleware = async (req, res, next) => {
  // Accept token from Authorization header OR ?token= query param (needed for EventSource/SSE)
  let token = req.headers.authorization?.split(" ")[1];
  if (!token && req.query.token) token = req.query.token;

    if (!token) {
        return res.status(401).json({ message: "Access Denied, No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

        if (!decoded.email) {
            return res.status(401).json({ message: "Invalid Token: Email Missing" });
        }

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized Access: User Not Found" });
        }

        // Block mid-session: if user was blocked after login
        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been suspended.",
                code: "ACCOUNT_BLOCKED"
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
