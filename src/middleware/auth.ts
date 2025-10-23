import jwt from "jsonwebtoken";

export const decodedToken = (token: string) => {
  if (!token) {
    return null;
  }

  // First try to decode with regular JWT secret
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded as { sellerId: string };
  } catch (error) {
    console.error("Failed to decode with regular secret, trying refresh secret", error);
  }

  // If regular JWT fails, try with refresh JWT secret
  try {
    const refreshDecoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    return refreshDecoded as { sellerId: string };
  } catch (error) {
    console.error("Error decoding token with both secrets:", error);
    return null;
  }
};
