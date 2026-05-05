import jwt from "jsonwebtoken";

export const createAccessToken = (id: string): string => {
  return jwt.sign({ id },process.env.ACCESS_TOKEN_SECRET as string,{ expiresIn: "15m" })
};

export const createRefreshToken = (id: string): string => {
  return jwt.sign({ id },process.env.REFRESH_TOKEN_SECRET as string,{ expiresIn: "7d" })
};