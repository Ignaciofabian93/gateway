import jwt from "jsonwebtoken";

export const decodedToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded as { id: string };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
