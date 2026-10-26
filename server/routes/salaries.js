import { Router } from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddliware.js";
import SalaryRecord from "../models/SalaryRecord.js";
import User from "../models/User.js";

const router = Router();
router.use(authMiddleware);

const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access is required." });
    }
    next();
};

const employeeDetails = {
    path: "employeeId",
    select: "name email department",
};

router.get("/", async (req, res, next) => {
    try {
        const filter = req.user.role === "admin" ? {} : { employeeId: req.user._id };
        const records = await SalaryRecord.find(filter)
            .populate(employeeDetails)
            .sort({ payDate: -1, createdAt: -1 })
            .lean();
        res.json({ records });
    } catch (error) {
        next(error);
    }
});

router.post("/", requireAdmin, async (req, res, next) => {
    try {
        const { employeeId, salary, allowance = 0, deduction = 0, payDate } = req.body ?? {};
        if (!mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({ message: "Select a valid employee." });
        }
        const amounts = { salary, allowance, deduction };
        if (Object.entries(amounts).some(([field, value]) =>
            typeof value !== "number" || !Number.isFinite(value) || value < 0
        )) {
            return res.status(400).json({ message: "Salary, allowance, and deduction must be valid non-negative numbers." });
        }
        if (deduction > salary + allowance) {
            return res.status(400).json({ message: "Deduction cannot be greater than salary plus allowance." });
        }
        if (
            typeof payDate !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(payDate) ||
            Number.isNaN(Date.parse(`${payDate}T00:00:00.000Z`))
        ) {
            return res.status(400).json({ message: "Enter a valid pay date." });
        }

        const employee = await User.findOne({ _id: employeeId, role: "employee" }).select("_id");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        const record = await SalaryRecord.create({
            employeeId: employee._id,
            salary,
            allowance,
            deduction,
            total: salary + allowance - deduction,
            payDate: new Date(`${payDate}T00:00:00.000Z`),
        });
        await record.populate(employeeDetails);
        res.status(201).json({ record });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

export default router;
