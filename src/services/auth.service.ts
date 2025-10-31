import { ResponseMessage } from "response-messages";
import { AuthRepository } from "../repositories/auth.repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../helpers/jwt";

interface UserInfo {
  email: string;
  password: string;
}

interface RegisterInfo {
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

 
  public async userRegister(payload: RegisterInfo) {
    try {
      const userExists = await this.authRepository.existsByEmail(payload.email);
      if (userExists) {
        return ResponseMessage.conflict("User already exists with this email");
      }

      const newUser = await this.authRepository.create({
        username: payload.username,
        email: payload.email,
        password: payload.password,
      });

      return ResponseMessage.created("User registered successfully");
    } catch (error: any) {
      return ResponseMessage.internalServerError(error.message || "Registration failed");
    }
  }

  public async userLogin(payload: UserInfo) {
    try {
      const existingUser = await this.authRepository.findOne(
        { email: payload.email },
        { select: "+password" }
      );

      if (!existingUser) return ResponseMessage.notFound("User not found");

      const isPasswordMatch = await existingUser.comparePassword(payload.password);
      if (!isPasswordMatch) return ResponseMessage.badRequest("Invalid credentials");

      const userPayload = {
        id: existingUser._id.toString(),
      };

      const accessToken = signAccessToken(userPayload);
      const refreshToken = signRefreshToken(userPayload);


      await this.authRepository.storeRefreshToken(existingUser._id.toString(), refreshToken);

      return ResponseMessage.ok("Login successful", {
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      return ResponseMessage.internalServerError(error.message || "Login failed");
    }
  }

  public async refreshAccessToken(oldRefreshToken: string) {
    try {
      const decoded = verifyRefreshToken(oldRefreshToken);

      const user = await this.authRepository.findByRefreshToken(oldRefreshToken);
      
      if (!user) {
        return ResponseMessage.forbidden("Invalid refresh token");
      }

      const userPayload = {
        id: user._id.toString(),
      };

      const newAccessToken = signAccessToken(userPayload);
      const newRefreshToken = signRefreshToken(userPayload);

      await this.authRepository.storeRefreshToken(user._id.toString(), newRefreshToken);

      return ResponseMessage.ok("Token refreshed successfully", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error: any) {
      return ResponseMessage.forbidden("Invalid or expired refresh token");
    }
  }

  public async userLogout(userId: string) {
    try {
      await this.authRepository.clearRefreshToken(userId);
      return ResponseMessage.ok("Logged out successfully", null);
    } catch (error: any) {
      return ResponseMessage.internalServerError(error.message || "Logout failed");
    }
  }

  public async getUserProfile(userId: string) {
    try {
      const user = await this.authRepository.findById(userId);

      if (!user) {
        return ResponseMessage.notFound("User not found");
      }

      return ResponseMessage.ok("Profile retrieved successfully", {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      return ResponseMessage.internalServerError(error.message || "Failed to get profile");
    }
  }
}
