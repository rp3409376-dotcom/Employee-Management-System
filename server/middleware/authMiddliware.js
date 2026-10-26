import jwt from 'jsonwebtoken'
import User from '../models/User.js';
const verifyUser = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        const [scheme, token] = authorization?.split(/\s+/, 2) ?? [];
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ success: false, error: "A bearer token is required." });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
            return res.status(401).json({ success: false, error: "User not found." });
        }

        req.user = user;
        next()
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, error: "The bearer token is invalid or expired." });
        }
        console.error(error);
        return res.status(500).json({ message: false, error: "Internal server error." });
    }
}

export default verifyUser