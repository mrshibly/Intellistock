import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../users/user.model';
import { Org } from '../orgs/org.model';
import { signAccess, signRefresh, verifyRefresh } from '../../utils/jwt';
import { safeCompare } from '../../utils/tokenCompare';

export class AuthService {
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async register(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        const err = new Error('Email already registered') as any;
        err.statusCode = 409;
        err.code = 'CONFLICT';
        throw err;
      }

      const userId = new mongoose.Types.ObjectId();
      const orgId = new mongoose.Types.ObjectId();
      const slug = data.orgName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      const org = new Org({
        _id: orgId,
        name: data.orgName,
        slug: slug || orgId.toString(),
        ownerId: userId,
        plan: 'starter',
      });
      await org.save({ session });

      const user = new User({
        _id: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 10),
        orgId: org._id,
        role: 'owner',
      });
      await user.save({ session });

      const accessToken = signAccess({
        userId: (user._id as any).toString(),
        orgId: (org._id as any).toString(),
        role: user.role,
      });

      const refreshToken = signRefresh({ userId: (user._id as any).toString() });
      user.refreshTokenHash = this.hashToken(refreshToken);
      await user.save({ session });

      await session.commitTransaction();

      return { user, accessToken, refreshToken };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash +orgId');
    if (!user || user.isDeleted) {
      const err = new Error('Invalid email or password') as any;
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password') as any;
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const accessToken = signAccess({
      userId: (user._id as any).toString(),
      orgId: (user.orgId as any).toString(),
      role: user.role,
    });

    const refreshToken = signRefresh({ userId: (user._id as any).toString() });
    user.refreshTokenHash = this.hashToken(refreshToken);
    await user.save();

    return { user, accessToken, refreshToken };
  }

  static async refresh(token: string) {
    if (!token) {
      const err = new Error('Refresh token required') as any;
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const decoded = verifyRefresh(token);
    const user = await User.findById(decoded.userId).select('+refreshTokenHash +orgId');

    if (!user) {
      const err = new Error('User not found') as any;
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    if (!user.refreshTokenHash || !safeCompare(user.refreshTokenHash, this.hashToken(token))) {
      // Reuse detected - revoke
      user.refreshTokenHash = undefined;
      await user.save();
      const err = new Error('Refresh token reuse detected') as any;
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const accessToken = signAccess({
      userId: (user._id as any).toString(),
      orgId: (user.orgId as any).toString(),
      role: user.role,
    });

    const newRefreshToken = signRefresh({ userId: (user._id as any).toString() });
    user.refreshTokenHash = this.hashToken(newRefreshToken);
    await user.save();

    return { user, accessToken, refreshToken: newRefreshToken };
  }

  static async logout(token: string) {
    if (!token) return;
    try {
      const decoded = verifyRefresh(token);
      const user = await User.findById(decoded.userId).select('+refreshTokenHash');
      if (user && user.refreshTokenHash && safeCompare(user.refreshTokenHash, this.hashToken(token))) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
    } catch (error) {
      // Ignore token verification errors on logout
    }
  }

  static async verifyEmail(_token: string) {
    throw new Error('NotImplementedError: verifyEmail logic will be added');
  }
}
