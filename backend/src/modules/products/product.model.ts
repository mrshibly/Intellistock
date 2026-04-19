import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProductUnit = 'pcs' | 'kg' | 'g' | 'l' | 'ml' | 'm' | 'box' | 'set';

export interface IProduct extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  description?: string;
  categoryId?: mongoose.Types.ObjectId;
  unit: ProductUnit;
  costPrice: number;
  sellingPrice: number;
  barcode?: string;
  supplierId?: mongoose.Types.ObjectId;
  images: string[];
  tags: string[];
  reorderPoint: number;
  reorderQty: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    description: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    unit: {
      type: String,
      enum: ['pcs', 'kg', 'g', 'l', 'ml', 'm', 'box', 'set'],
      required: true,
    },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    barcode: { type: String, trim: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    images: [{ type: String }],
    tags: [{ type: String }],
    reorderPoint: { type: Number, default: 0, min: 0 },
    reorderQty: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Compound index for SKU uniqueness per org
productSchema.index({ orgId: 1, sku: 1 }, { unique: true });

// Text index for search
productSchema.index({ name: 'text', sku: 'text', barcode: 'text', tags: 'text' });

// Index for listing
productSchema.index({ orgId: 1, isDeleted: 1 });

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
