import { Request, Response } from "express";
import { compare } from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import prisma from "../client/prisma";
import { environment } from "../config/config";

export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const formattedEmail = email.toLowerCase();
  const user = await prisma.seller.findUnique({ where: { email: formattedEmail } });
  if (!user) {
    res.status(400).json({ error: "No se encontró al usuario" });
    return;
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    res.status(400).json({ message: "Credenciales inválidas" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "15min" });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: environment === "production" || environment === "qa",
    secure: environment === "production" || environment === "qa",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    domain: environment === "production" || environment === "qa" ? ".ekoru.cl" : undefined,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: environment === "production" || environment === "qa",
    secure: environment === "production" || environment === "qa",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: environment === "production" || environment === "qa" ? ".ekoru.cl" : undefined,
  });
  res.json({ token, message: "Inicio de sesión exitoso" });
};

export const RefreshToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No se pudo generar un nuevo token de acceso" });
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
    const newToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET as string, { expiresIn: "15m" });
    res.cookie("token", newToken, {
      httpOnly: environment === "production" || environment === "qa",
      secure: environment === "production" || environment === "qa",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      domain: environment === "production" || environment === "qa" ? ".ekoru.cl" : undefined,
    });
    res.json({ token: newToken, success: true });
  } catch {
    res.status(401).json({ message: "Token de acceso inválido" });
  }
};
