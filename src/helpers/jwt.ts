import jwt, { SignOptions, JwtPayload as DefaultJwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_change_me";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_change_me";

// Cast to proper type immediately
const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as string;
const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as string;

export interface JwtPayload extends DefaultJwtPayload {
  id: string;
}

/**
 * Sign an access token
 */
export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET as jwt.Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as any, // Type assertion to bypass strict typing
    algorithm: "HS256",
  });
};

/**
 * Sign a refresh token
 */
export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET as jwt.Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
    algorithm: "HS256",
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as jwt.Secret) as JwtPayload;
  return decoded;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET as jwt.Secret) as JwtPayload;
  return decoded;
};
