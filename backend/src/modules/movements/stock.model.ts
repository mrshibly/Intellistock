import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStock extends Document {
  orgId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  quantity: number;
  updatedAt: Date;
}

const stockSchema = new Schema<IStock>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

// Compound unique index for stock per product per warehouse
stockSchema.index({ orgId: 1, productId: 1, warehouseId: 1 }, { unique: true });

export const Stock: Model<IStock> = mongoose.model<IStock>('Stock', stockSchema);
