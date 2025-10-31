import { IUser, UserModel } from "../model/auth.model";
import { CrudRepository } from "./crud.repository";

export class AuthRepository extends CrudRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email }).select("+password").exec();
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<IUser | null> {
    return await this.model
      .findByIdAndUpdate(
        userId,
        { refreshToken },
        { new: true }
      )
      .exec();
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return await this.model.findOne({ refreshToken }).select("+refreshToken").exec();
  }

  
  async clearRefreshToken(userId: string): Promise<IUser | null> {
    return await this.model
      .findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
      )
      .exec();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.model.countDocuments({ email }).exec();
    return count > 0;
  }
}
