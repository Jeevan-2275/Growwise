import mongoose, { Schema, Document } from 'mongoose';

export interface IVirtualPortfolio extends Document {
  userId: Schema.Types.ObjectId;
  holdings: {
    schemeCode: string;
    units: number;
    investedAmount: number;
  }[];
  transactions: {
    schemeCode: string;
    type: 'buy' | 'sell';
    units: number;
    nav: number;
    amount: number;
    date: Date;
  }[];
}

const VirtualPortfolioSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  holdings: [
    {
      schemeCode: String,
      units: Number,
      investedAmount: Number,
    },
  ],
  transactions: [
    {
      schemeCode: String,
      type: { type: String, enum: ['buy', 'sell'] },
      units: Number,
      nav: Number,
      amount: Number,
      date: Date,
    },
  ],
});

export default mongoose.models.VirtualPortfolio || mongoose.model<IVirtualPortfolio>('VirtualPortfolio', VirtualPortfolioSchema);
