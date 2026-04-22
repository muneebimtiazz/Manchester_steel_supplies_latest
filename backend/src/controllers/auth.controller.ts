import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../utils/tokens";

type registerBody = {
  fname: string;
  lname: string;
  email: string;
  password: string;
};

type loginBody = {
  email: string;
  password: string;
};

type userBody = {
  id: string;
  email: string;
  iat: number;
  exp: number;
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  const { fname, lname, email, password }: registerBody = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
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

     res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ message: "Registration Success" });
  } catch (error) {
    return res.status(400).json({ message: "Registration Failed" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password }: loginBody = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email or Password is Incorrect" });
    }

    const match = await bcrypt.compare(password, user.password!);

    if (!match) {
      return res.status(400).json({ message: "Email or Password is Incorrect" });
    }

    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());

    res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login Success" });
  } catch (error) {
    return res.status(400).json({ message: "Login Failed" });
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("AccessToken");
  res.clearCookie("RefreshToken");

  return res.status(200).json({ message: "Logout Success" });
};

// REFRESH TOKEN
export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.RefreshToken;

  try {
    if (!token) {
      return res.status(401).json({ message: "No RefreshToken" });
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as userBody;

    const newAccessToken = createAccessToken(decoded.id);

    res.cookie("AccessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Token Reassigned" });
  } catch (error) {
    return res.status(401).json({ message: "Refresh expired or invalid" });
  }
};

// ME (PROTECTED ROUTE)
export const me = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
  });
};