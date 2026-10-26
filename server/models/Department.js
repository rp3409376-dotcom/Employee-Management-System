import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    dep_name: {type: String, required: true, trim: true, maxlength: 100},
    description: {type: String, trim: true, maxlength: 1000},
}, {
    timestamps: true,
});

const Department = mongoose.model("Department", departmentSchema);
export default Department;