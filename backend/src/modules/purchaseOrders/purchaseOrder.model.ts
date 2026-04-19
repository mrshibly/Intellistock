import mongoose, { Schema, Document, Model } from 'mongoose';

export type POStatus = 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'received' | 'cancelled';

export interface IPurchaseOrder extends Document {
  orgId: mongoose.Types.ObjectId;
  poNumber: string;
  supplierId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  status: POStatus;
  lineItems: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    receivedQty: number;
  }[];
  totalAmount: number;
  expectedDelivery?: Date;
  notes?: string;
  sentAt?: Date;
  receivedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    poNumber: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled'],
      default: 'draft',
    },
    lineItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        sku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitCost: { type: Number, required: true, min: 0 },
        receivedQty: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true },
    expectedDelivery: { type: Date },
    notes: { type: String },
    sentAt: { type: Date },
    receivedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const PurchaseOrder: Model<IPurchaseOrder> = mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
