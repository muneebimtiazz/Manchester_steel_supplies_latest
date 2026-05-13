// import { Response} from "express";

// export const setAccessTokenCookie = (res: Response, token: string) => {
//   res.cookie("AccessToken", token, {
//       httpOnly: true,
//       secure: false,  //true 
//       sameSite: "lax", //none
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });
// };

// export const setRefreshTokenCookie = (res: Response, token: string) => {
//   res.cookie("RefreshToken", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });
// };

// export const clearAuthCookies = (res: Response) => {
//   res.clearCookie("AccessToken", {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax"});
  
//       res.clearCookie("RefreshToken", {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax"});
// };




import { Response } from "express";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("AccessToken", token, cookieOptions);
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("RefreshToken", token, cookieOptions);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("AccessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.clearCookie("RefreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};

