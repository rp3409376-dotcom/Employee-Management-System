import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String, trim: true, maxlength: 100 },
    department: { type: String, trim: true, maxlength: 100 },
    leaveType: { type: String, enum: ["Casual", "Sick", "Annual", "Unpaid"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, {
    timestamps: true,
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

export default LeaveRequest;
