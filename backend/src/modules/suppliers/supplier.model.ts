import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplier extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  leadTimeDays: number;
  paymentTerms?: string;
  currency: string;
  notes?: string;
  isDeleted: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String },
    leadTimeDays: { type: Number, default: 7 },
    paymentTerms: { type: String },
    currency: { type: String, default: 'USD' },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Supplier: Model<ISupplier> = mongoose.model<ISupplier>('Supplier', supplierSchema);
