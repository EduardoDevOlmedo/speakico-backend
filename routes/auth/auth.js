
import bcrypt from "bcrypt";
import { PrismaClient } from "../../generated/prisma-client/client.js";
import { login, generateToken } from "./login.js";

const prisma = new PrismaClient();

export const createUser = async (req, res) => {
  try {
    const { email, password, name, level, interests, targetLanguage } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son obligatorios" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ error: "Usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        level,
        interests,
        prevFeedback: "",
        avgSuccessRate: 0,
        totalAttempts: 0,
        audioSuccessRate: 0,
        speechSuccessRate: 0,
        textSuccessRate: 0,
        targetLanguage: targetLanguage ?? "es",
      },
    });

    const token = generateToken(user);

    res.status(201)
    res.cookie("token", token, {
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
      .json({
        message: "Usuario creado", user: {
          token: token,
          id: user.id,
          email: user.email,
          name: user.name,
          interests: user.interests,
          level: user.level,
          prevFeedback: user.prevFeedback ?? "",
          avgSuccessRate: user.avgSuccessRate ?? 0,
          totalAttempts: user.totalAttempts ?? 0,
          audioSuccessRate: user.audioSuccessRate ?? 0,
          speechSuccessRate: user.speechSuccessRate ?? 0,
          textSuccessRate: user.textSuccessRate ?? 0,
          targetLanguage: user.targetLanguage ?? "es",
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const loginUser = login;
