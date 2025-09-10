import express from "express";
import { createUser, loginUser } from "./auth.js";
import { getAllUsers, getUserById, updateUser, deleteUser } from "./users.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { checkToken } from "./check-token.js";

const router = express.Router();

router.post("/create", createUser);
router.post("/login", loginUser);
router.post("/check-token", checkToken);

router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;
