import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type Role = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';

export interface IUser extends Document {
  orgId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  googleId?: string;
  role: Role;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  refreshTokenHash?: string;
  failedLoginAttempts: number;
  lockUntil?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  comparePassword(plain: string): Promise<boolean>;
  isLocked(): boolean;
}

const userSchema = new Schema<IUser>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    googleId: { type: String, sparse: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'staff', 'viewer'],
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date },
    refreshTokenHash: { type: String, select: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
