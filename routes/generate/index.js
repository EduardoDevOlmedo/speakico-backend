import express from "express";
import { generateExercises } from "./exercises.js";
import { deleteAllAudios } from "./delete-audios.js";

const router = express.Router();

router.post("/", generateExercises);
router.delete("/", deleteAllAudios);

export default router;  