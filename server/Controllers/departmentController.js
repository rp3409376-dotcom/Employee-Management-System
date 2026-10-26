import Department from "../models/Department.js";

const getDepartment = async (req, res) => {
  try {
    const department = await Department.find();
    return res.status(200).json({ success: true, department });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get department server error" });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }
    return res.status(200).json({ success: true, department });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;
    return res.status(status).json({
      success: false,
      error:
        status === 400
          ? "Invalid department ID"
          : "get department server error",
    });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;
    if (typeof dep_name !== "string" || !dep_name.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Department name is required" });
    }

    const newDep = new Department({
      dep_name: dep_name.trim(),
      description: typeof description === "string" ? description.trim() : "",
    });
    await newDep.save();
    return res.status(201).json({ success: true, department: newDep });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res
      .status(500)
      .json({ success: false, error: "add department server error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;
    if (typeof dep_name !== "string" || !dep_name.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Department name is required" });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        dep_name: dep_name.trim(),
        description: typeof description === "string" ? description.trim() : "",
      },
      { new: true, runValidators: true },
    );
    if (!department) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }
    return res.status(200).json({ success: true, department });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;
    return res.status(status).json({
      success: false,
      error:
        status === 400
          ? "Invalid department ID"
          : "update department server error",
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }
    return res.status(200).json({ success: true, department });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;
    return res.status(status).json({
      success: false,
      error:
        status === 400
          ? "Invalid department ID"
          : "delete department server error",
    });
  }
};

export {
  addDepartment,
  deleteDepartment,
  getDepartment,
  getDepartmentById,
  updateDepartment,
};
