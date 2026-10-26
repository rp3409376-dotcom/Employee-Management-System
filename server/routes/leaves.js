import { Router } from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddliware.js";
import LeaveRequest from "../models/LeaveRequest.js";
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
        const requests = await LeaveRequest.find(filter)
            .populate(employeeDetails)
            .sort({ createdAt: -1 })
            .lean();
        res.json({ requests });
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { employeeId, employeeName, department, leaveType, startDate, endDate, reason, status } = req.body ?? {};
        const targetEmployeeId = req.user.role === "admin" ? employeeId : req.user._id;
        const validLeaveTypes = ["Casual", "Sick", "Annual", "Unpaid"];
        if (req.user.role === "admin" && status !== undefined && !["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Select a valid leave status." });
        }
        if (!targetEmployeeId || !mongoose.isValidObjectId(targetEmployeeId)) {
            return res.status(400).json({ message: "Select a valid employee." });
        }
        if (!validLeaveTypes.includes(leaveType)) {
            return res.status(400).json({ message: "Select a valid leave type." });
        }
        if (
            typeof startDate !== "string" ||
            typeof endDate !== "string" ||
            Number.isNaN(Date.parse(startDate)) ||
            Number.isNaN(Date.parse(endDate)) ||
            new Date(endDate) < new Date(startDate)
        ) {
            return res.status(400).json({ message: "Enter valid leave dates; the end date must not be before the start date." });
        }
        if (typeof reason !== "string" || !reason.trim() || reason.trim().length > 500) {
            return res.status(400).json({ message: "A reason of up to 500 characters is required." });
        }
        if (
            (employeeName !== undefined && (typeof employeeName !== "string" || !employeeName.trim() || employeeName.trim().length > 100)) ||
            (department !== undefined && (typeof department !== "string" || department.trim().length > 100))
        ) {
            return res.status(400).json({ message: "Name and department must be valid text up to 100 characters." });
        }

        const employee = await User.findOne({ _id: targetEmployeeId, role: "employee" }).select("_id name department");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        const request = await LeaveRequest.create({
            employeeId: employee._id,
            employeeName: employee.name,
            department: typeof department === "string" ? department.trim() : employee.department || "",
            leaveType,
            startDate: new Date(`${startDate.slice(0, 10)}T00:00:00.000Z`),
            endDate: new Date(`${endDate.slice(0, 10)}T00:00:00.000Z`),
            reason: reason.trim(),
            status: req.user.role === "admin" ? status || "Pending" : "Pending",
        });
        await request.populate(employeeDetails);
        res.status(201).json({ request });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

router.patch("/:id/status", requireAdmin, async (req, res, next) => {
    try {
        const { status } = req.body ?? {};
        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be Approved or Rejected." });
        }
        const request = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true },
        ).populate(employeeDetails);
        if (!request) {
            return res.status(404).json({ message: "Leave request not found." });
        }
        res.json({ request });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid leave request ID." });
        }
        next(error);
    }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
    try {
        const { employeeId, leaveType, startDate, endDate, department, reason, status } = req.body ?? {};
        const validLeaveTypes = ["Casual", "Sick", "Annual", "Unpaid"];
        const validStatuses = ["Pending", "Approved", "Rejected"];
        if (!mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({ message: "Select a valid employee." });
        }
        if (!validLeaveTypes.includes(leaveType)) {
            return res.status(400).json({ message: "Select a valid leave type." });
        }
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Select a valid leave status." });
        }
        if (
            typeof startDate !== "string" ||
            typeof endDate !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
            Number.isNaN(Date.parse(`${startDate}T00:00:00.000Z`)) ||
            Number.isNaN(Date.parse(`${endDate}T00:00:00.000Z`)) ||
            endDate < startDate
        ) {
            return res.status(400).json({ message: "Enter valid leave dates; the end date must not be before the start date." });
        }
        if (typeof reason !== "string" || !reason.trim() || reason.trim().length > 500) {
            return res.status(400).json({ message: "A reason of up to 500 characters is required." });
        }
        if (department !== undefined && (typeof department !== "string" || department.trim().length > 100)) {
            return res.status(400).json({ message: "Department must be text up to 100 characters." });
        }

        const employee = await User.findOne({ _id: employeeId, role: "employee" }).select("_id name department");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }
        const request = await LeaveRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Leave request not found." });
        }

        request.employeeId = employee._id;
        request.employeeName = employee.name;
        request.department = typeof department === "string" ? department.trim() : employee.department || "";
        request.leaveType = leaveType;
        request.startDate = new Date(`${startDate}T00:00:00.000Z`);
        request.endDate = new Date(`${endDate}T00:00:00.000Z`);
        request.reason = reason.trim();
        request.status = status;
        await request.save();
        await request.populate(employeeDetails);
        res.json({ request });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid leave request or employee ID." });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const request = await LeaveRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Leave request not found." });
        }
        const isOwner = String(request.employeeId) === String(req.user._id);
        if (req.user.role !== "admin" && (!isOwner || request.status !== "Pending")) {
            return res.status(403).json({ message: "You can only cancel your own pending leave request." });
        }
        await request.deleteOne();
        res.json({ success: true });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid leave request ID." });
        }
        next(error);
    }
});

export default router;
