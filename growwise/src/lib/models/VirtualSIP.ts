import mongoose, { Schema, Document } from 'mongoose';

export interface IVirtualSIP extends Document {
  userId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  schemeCode: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  nextInstallmentDate: Date;
  isActive: boolean;
}

const VirtualSIPSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  schemeCode: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
  startDate: { type: Date, default: Date.now },
  nextInstallmentDate: { type: Date },
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.VirtualSIP || mongoose.model<IVirtualSIP>('VirtualSIP', VirtualSIPSchema);
