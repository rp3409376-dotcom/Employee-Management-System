import mongoose from "mongoose";

const salaryRecordSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    salary: { type: Number, required: true, min: 0 },
    allowance: { type: Number, required: true, min: 0, default: 0 },
    deduction: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    payDate: { type: Date, required: true },
}, {
    timestamps: true,
});

const SalaryRecord = mongoose.model("SalaryRecord", salaryRecordSchema);

export default SalaryRecord;
