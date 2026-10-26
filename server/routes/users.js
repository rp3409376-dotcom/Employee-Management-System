import bcrypt from "bcrypt";
import { Router } from "express";
import authMiddleware from "../middleware/authMiddliware.js";
import User from "../models/User.js";

const router = Router();

router.get("/employees", authMiddleware, async (_req, res, next) => {
    try {
        const employees = await User.find({ role: "employee" })
            .select("name email profileImage department dateOfBirth")
            .sort({ name: 1 })
            .lean();
        res.json({ employees });
    } catch (error) {
        next(error);
    }
});

const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access is required." });
    }
    next();
};

router.get("/", authMiddleware, requireAdmin, async (_req, res, next) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ users });
    } catch (error) {
        next(error);
    }
});

router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const { name, email, password, role, department, dateOfBirth, profileImage } = req.body ?? {};
        if (
            ![name, email, role].every((value) => typeof value === "string" && value.trim()) ||
            typeof password !== "string" ||
            password.length < 8
        ) {
            return res.status(400).json({ message: "Name, email, and role are required; password must be at least 8 characters." });
        }
        if (role !== "employee") {
            return res.status(400).json({ message: "Only employee accounts can be created here." });
        }
        if (department !== undefined && typeof department !== "string") {
            return res.status(400).json({ message: "Department must be a string." });
        }
        if (
            dateOfBirth !== undefined &&
            dateOfBirth !== "" &&
            (typeof dateOfBirth !== "string" || Number.isNaN(Date.parse(dateOfBirth)))
        ) {
            return res.status(400).json({ message: "Date of birth must be a valid date." });
        }
        if (profileImage !== undefined && typeof profileImage !== "string") {
            return res.status(400).json({ message: "Profile image must be a URL string." });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: await bcrypt.hash(password, 10),
            role,
            department: typeof department === "string" ? department.trim() : "",
            dateOfBirth: dateOfBirth || undefined,
            profileImage: typeof profileImage === "string" ? profileImage.trim() : undefined,
        });

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                dateOfBirth: user.dateOfBirth,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "A user with this email already exists." });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

router.put("/:id", authMiddleware, (req, res, next) => {
    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.role === "employee" && String(req.user._id) === String(req.params.id);
    if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: "You can only edit your own employee profile." });
    }
    next();
}, async (req, res, next) => {
    try {
        const { name, email, department, dateOfBirth } = req.body ?? {};
        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim()
        ) {
            return res.status(400).json({ message: "Name and email are required." });
        }
        if (department !== undefined && typeof department !== "string") {
            return res.status(400).json({ message: "Department must be a string." });
        }
        if (
            dateOfBirth !== undefined &&
            dateOfBirth !== "" &&
            (typeof dateOfBirth !== "string" || Number.isNaN(Date.parse(dateOfBirth)))
        ) {
            return res.status(400).json({ message: "Date of birth must be a valid date." });
        }

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, role: "employee" },
            {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                department: typeof department === "string" ? department.trim() : "",
                dateOfBirth: dateOfBirth || null,
            },
            { new: true, runValidators: true },
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Employee not found." });
        }
        res.json({ user });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "A user with this email already exists." });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid employee ID." });
        }
        next(error);
    }
});

router.delete("/:id", authMiddleware, requireAdmin, async (req, res, next) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, role: "employee" }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Employee not found." });
        }
        res.json({ success: true, user });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid employee ID." });
        }
        next(error);
    }
});

export default router;
