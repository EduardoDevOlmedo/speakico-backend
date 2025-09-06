import express from "express";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { createUser, loginUser } from "./auth.js";
import { getAllUsers, getUserById, updateUser, deleteUser } from "./users.js";

const router = express.Router();

router.post("/create", createUser);
router.post("/login", loginUser);

router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;
