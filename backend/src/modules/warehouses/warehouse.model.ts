import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWarehouse extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  address: {
    street?: string;
    city?: string;
    country: string;
  };
  timezone: string;
  contactEmail?: string;
  contactPhone?: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: {
      street: { type: String },
      city: { type: String },
      country: { type: String, required: true },
    },
    timezone: { type: String, default: 'UTC' },
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Warehouse: Model<IWarehouse> = mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
