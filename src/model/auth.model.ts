/**
 * ============================================================================
 * User Data Model
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Defines MongoDB schema for storing user accounts and authentication state.
 * Handles password hashing and comparison for secure authentication.
 *
 * SCHEMA DESIGN:
 * - username: Unique identifier for users (3-30 chars)
 * - email: Unique email, used for login (validated format)
 * - password: Hashed with bcrypt (12 rounds), never returned in queries
 * - role: RBAC (admin, user, moderator) for permission control
 * - refreshToken: Stores current valid refresh token for logout capability
 * - isActive: Soft-delete flag to deactivate accounts
 * - lastLogin: Timestamp for tracking user activity
 * - timestamps: Auto-managed createdAt, updatedAt for audit trails
 *
 * SECURITY FEATURES:
 * 1. Password Hashing (pre-save hook):
 *    - Only hashes if password is modified
 *    - Uses bcryptjs with 12 salt rounds (OWASP recommended)
 *    - Password never stored in plain text
 *
 * 2. Indexes:
 *    - Email indexed for fast lookups during login
 *    - RefreshToken indexed for quick token validation
 *
 * 3. Field Selection:
 *    - Password marked select: false (not returned by default)
 *    - RefreshToken marked select: false (sensitive data)
 *
 * FLOW:
 * 1. User registration → Password hashed before saving
 * 2. User login → comparePassword() validates credentials
 * 3. Token issued → RefreshToken stored in DB
 * 4. Token refresh → Validate token exists in DB before issuing new one
 * 5. Logout → RefreshToken cleared from DB (token revocation)
 *
 * ============================================================================
 */

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "moderator";
  refreshToken?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["admin", "user", "moderator"],
      default: "user",
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ refreshToken: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const UserModel = mongoose.model<IUser>("User", userSchema);
