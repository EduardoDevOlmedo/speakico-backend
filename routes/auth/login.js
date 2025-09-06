import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../generated/prisma-client/client.js";

const prisma = new PrismaClient();

export const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Correo o contraseña inválidos" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Correo o contraseña inválidos" });
    }

    const token = generateToken(user);



    res
      .cookie("token", token, { httpOnly: false, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 })
      .json({
        message: "Login exitoso",
        user: {
          token: token,
          id: user.id,
          email: user.email,
          name: user.name,
          interests: user.interests,
          level: user.level,
          avgSuccessRate: user.avgSuccessRate ?? 0,
          totalAttempts: user.totalAttempts ?? 0,
          audioSuccessRate: user.audioSuccessRate ?? 0,
          textSuccessRate: user.textSuccessRate ?? 0,
          speechSuccessRate: user.speechSuccessRate ?? 0,
          targetLanguage: user.targetLanguage === null ? "es" : user.targetLanguage,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error interno" });
  }
};
