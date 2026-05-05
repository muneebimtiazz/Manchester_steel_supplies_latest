import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type AuthToken = {
  id: string;
  iat: number;
  exp: number;
};

export interface AuthRequest extends Request {
  user?: AuthToken;
}

export const verifyAccessToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.AccessToken;

  console.log("ACCESS COOKIE:", token);

  if (!token) {
    return res.status(401).json({ message: "No Token Found" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as AuthToken;

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};