import mongoose, { Schema, Document, Model } from 'mongoose';

export type MovementType = 'receive' | 'sell' | 'transfer_in' | 'transfer_out' | 'adjust' | 'return' | 'write_off';

export interface IMovement extends Document {
  orgId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  type: MovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reference?: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const movementSchema = new Schema<IMovement>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    type: {
      type: String,
      enum: ['receive', 'sell', 'transfer_in', 'transfer_out', 'adjust', 'return', 'write_off'],
      required: true,
    },
    quantity: { type: Number, required: true },
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    reference: { type: String },
    notes: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Movement: Model<IMovement> = mongoose.model<IMovement>('Movement', movementSchema);
