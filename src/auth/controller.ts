import { Request, Response } from "express";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../client/prisma";

export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const formattedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: formattedEmail } });
  if (!user) {
    res.status(400).json({ error: "No se encontró al usuario" });
    return;
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    res.status(400).json({ message: "Credenciales inválidas" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
  res.cookie("token", token, {
    httpOnly: process.env.ENVIRONMENT === "production" ? true : false,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ token, message: "Inicio de sesión exitoso" });
};
