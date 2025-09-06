import { PrismaClient } from "../../generated/prisma-client/client.js";

const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  res.json(users);
};

export const getUserById = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true },
  });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(user);
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { totalAttempts: true }
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const body = req.body;

    // if there is a totalAttempts, calculate the accumulated
    if (body.totalAttempts !== undefined) {
      body.totalAttempts = (existingUser.totalAttempts || 0) + body.totalAttempts;
    }

    const audioSuccessRate = body.audioSuccessRate !== undefined ? body.audioSuccessRate : existingUser.audioSuccessRate;
    const textSuccessRate = body.textSuccessRate !== undefined ? body.textSuccessRate : existingUser.textSuccessRate;
    const speechSuccessRate = body.speechSuccessRate !== undefined ? body.speechSuccessRate : existingUser.speechSuccessRate;

    const data = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined),
    );

    const updateData = { ...data, prevFeedback: body.prevFeedback };

    if (
      body.avgSuccessRate !== undefined ||
      (audioSuccessRate !== undefined && textSuccessRate !== undefined && speechSuccessRate !== undefined)
    ) {
      updateData.avgSuccessRate =
        body.avgSuccessRate !== undefined
          ? body.avgSuccessRate
          : Number(((audioSuccessRate + textSuccessRate + speechSuccessRate) / 3).toFixed(2));
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar", error: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(400).json({ message: "Error al eliminar", error: err });
  }
};
