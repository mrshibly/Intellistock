import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IForecast extends Document {
  productId: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  predictedDemand: number;
  confidence: number;
  period: string; // e.g., "2024-05"
  reasoning?: string;
  createdAt: Date;
  updatedAt: Date;
}

const forecastSchema = new Schema<IForecast>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
    predictedDemand: { type: Number, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    period: { type: String, required: true },
    reasoning: { type: String },
  },
  { timestamps: true }
);

// Index for retrieving latest forecasts for an organization
forecastSchema.index({ orgId: 1, period: -1 });

export const Forecast: Model<IForecast> = mongoose.model<IForecast>('Forecast', forecastSchema);
