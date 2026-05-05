import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../utils/tokens";
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies} from "../utils/cookies";
import { AuthRequest } from "../middleware/auth.middleware";

// ===== TYPES =====
type RegisterBody = {
  fname: string;
  lname: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

type AuthToken = {
  id: string;
  iat: number;
  exp: number;
};

// ===== REGISTER =====
export const register = async (req: Request, res: Response) => {
  const { fname, lname, email, password }: RegisterBody = req.body;

  if (!fname || !lname || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fname,
      lname,
      email,
      password: hashed,
    });

    const accessToken = createAccessToken(newUser._id.toString());
    const refreshToken = createRefreshToken(newUser._id.toString());

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({ message: "Registration Success" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration Failed" });
  }
};

// ===== LOGIN =====
export const login = async (req: Request, res: Response) => {
  const { email, password } :LoginBody = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({ message: "Login Success" });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: "Login Failed" });
  }
};

// ===== LOGOUT =====
export const logout = async (req: Request, res: Response) => {
  clearAuthCookies(res);
  return res.status(200).json({ message: "Logout Success" });
};

// ===== REFRESH TOKEN =====
export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.RefreshToken; //raw encoded string, e1NiIsInR5cCI6IkpXVCJ9.eyJp

  if (!token) {
    return res.status(401).json({ message: "No RefreshToken" });
  }

  try {
    const decoded = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET as string) as AuthToken;

    const newAccessToken = createAccessToken(decoded.id) ;
    setAccessTokenCookie(res, newAccessToken);

    return res.status(200).json({ message: "Token Reassigned" });
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Refresh expired or invalid" });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  console.log("COOKIE RECEIVED:", req.cookies);
  console.log("USER:", req.user);

  if (!req.user) {
    return res.status(401).json({
      message: "Not authenticated (no valid token)"
    });
  }

  return res.status(200).json({
    id: req.user.id,
  });
};