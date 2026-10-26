import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ message: false, error: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
        if (!user) {
            return res.status(401).json({ message: false, error: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: false, error: "Invalid email or password." });
        }

        if (!process.env.JWT_KEY) {
            throw new Error("JWT_KEY environment variable is required");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "12h" },
        );
        return res.status(200).json({
            message: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: false, error: "Internal server error" });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body ?? {};
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: false,
                error: "Name, email, and a password with at least 8 characters are required.",
            });
        }

        if (!process.env.JWT_KEY) {
            throw new Error("JWT_KEY environment variable is required");
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 10),
            role: "employee",
        });
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "12h" },
        );

        return res.status(201).json({
            message: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: false, error: "An account with this email already exists." });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: false, error: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: false, error: "Unable to create account right now." });
    }
};

const verify = (req, res) => {
    const { _id, name, email, role } = req.user;
    return res.status(200).json({
        success: true,
        user: { id: _id, name, email, role },
    });
};

export { login, register, verify };