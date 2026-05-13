import { Response} from "express";

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("AccessToken", token, {
      httpOnly: true,
      secure: false,  //true 
      sameSite: "lax", //none
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("RefreshToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("AccessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax"});
  
      res.clearCookie("RefreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax"});
};

