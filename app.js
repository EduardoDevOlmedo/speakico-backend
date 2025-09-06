import express from "express";
import userRoutes from "./routes/auth/index.js"
import generateRoutes from "./routes/generate/index.js"
import { verifyToken } from "./middlewares/authMiddleware.js"
import { fileURLToPath } from 'url';
import cors from "cors";
import dotenv from "dotenv";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://speakico-front-itj9.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

dotenv.config();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("HEALTHCHECK: SERVER IS RUNNING");
});

app.use("/auth", userRoutes);
app.use("/generate", verifyToken, generateRoutes);
//expose public urls served from the backend to be consumed by frontend
app.use('/audios', express.static(path.join(__dirname, 'output_audio')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
