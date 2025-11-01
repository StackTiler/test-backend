import jwt, { SignOptions, JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import ENV from "../config/env.config";

const ACCESS_TOKEN_SECRET = ENV.JWT_ACCESS_SECRET || "access_secret_change_me";
const REFRESH_TOKEN_SECRET = ENV.JWT_REFRESH_SECRET || "refresh_secret_change_me";


const ACCESS_TOKEN_EXPIRES_IN = (ENV.JWT_ACCESS_EXPIRES_IN.toString() || "15m") as string;
const REFRESH_TOKEN_EXPIRES_IN = (ENV.JWT_REFRESH_EXPIRES_IN.toString() || "7d") as string;

export interface JwtPayload extends DefaultJwtPayload {
  id: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET as jwt.Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as any, // Type assertion to bypass strict typing
    algorithm: "HS256",
  });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET as jwt.Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
    algorithm: "HS256",
  });
};


export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as jwt.Secret) as JwtPayload;
  return decoded;
};


export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET as jwt.Secret) as JwtPayload;
  return decoded;
};
