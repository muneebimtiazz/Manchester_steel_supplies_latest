import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type userBody = {
  id: string;
  email: string;
  iat: number;
  exp: number;
};

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.AccessToken;

  console.log("cookie", req.cookies)

  if (!token) {
    return res.status(401).json({ message: "No Token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as userBody;

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};