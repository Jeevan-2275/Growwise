import mongoose, { Schema, Document } from 'mongoose';

export interface ICommission extends Document {
  period: {
    month: number;
    year: number;
  };
  customerId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  adminId: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  portfolioValue: number;
  annualRate: number;
  monthlyRate: number;
  totalCommission: number;
  breakdown: {
    company: number;
    admin: number;
    seller: number;
    mutualFund: number;
  };
  status: 'accrued' | 'available' | 'withdrawn';
  withdrawalDate?: Date;
  generatedAt: Date;
}

const CommissionSchema: Schema = new Schema({
  period: {
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  portfolioValue: { type: Number, required: true },
  annualRate: { type: Number, default: 0.02 },
  monthlyRate: { type: Number, default: 0.02 / 12 },
  totalCommission: { type: Number, required: true },
  breakdown: {
    company: { type: Number, required: true },
    admin: { type: Number, required: true },
    seller: { type: Number, required: true },
    mutualFund: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ['accrued', 'available', 'withdrawn'],
    default: 'accrued',
  },
  withdrawalDate: { type: Date },
  generatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);
