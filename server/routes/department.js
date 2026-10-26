import express from "express";
import authMiddleware from "../middleware/authMiddliware.js";
import {
  addDepartment,
  deleteDepartment,
  getDepartment,
  getDepartmentById,
  updateDepartment,
} from "../Controllers/departmentController.js";

const router = express.Router();

router.get("/", authMiddleware, getDepartment);
router.post("/", authMiddleware, addDepartment);
router.get("/:id", authMiddleware, getDepartmentById);
router.put("/:id", authMiddleware, updateDepartment);
router.delete("/:id", authMiddleware, deleteDepartment);

export default router;
