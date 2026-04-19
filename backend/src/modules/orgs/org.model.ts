import mongoose, { Schema, Document, Model } from 'mongoose';

export type Plan = 'starter' | 'growth' | 'pro';

export interface IOrg extends Document {
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orgSchema = new Schema<IOrg>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'pro'],
      default: 'starter',
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Org: Model<IOrg> = mongoose.model<IOrg>('Org', orgSchema);
