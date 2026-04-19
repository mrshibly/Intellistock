import mongoose, { Schema, Document, Model } from 'mongoose';

export type InsightType = 'stock_alert' | 'turnover' | 'anomaly' | 'optimization';
export type InsightSeverity = 'low' | 'medium' | 'high';

export interface IInsight extends Document {
  orgId: mongoose.Types.ObjectId;
  type: InsightType;
  content: string; // Markdown content
  severity: InsightSeverity;
  metadata?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const insightSchema = new Schema<IInsight>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    type: {
      type: String,
      enum: ['stock_alert', 'turnover', 'anomaly', 'optimization'],
      required: true,
    },
    content: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    metadata: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for listing unread insights
insightSchema.index({ orgId: 1, isRead: 1, createdAt: -1 });

export const Insight: Model<IInsight> = mongoose.model<IInsight>('Insight', insightSchema);
