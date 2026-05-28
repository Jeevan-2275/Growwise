import mongoose, { Schema, Document } from 'mongoose';

export interface IFund extends Document {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  navHistory: { date: Date; nav: number }[];
  lastUpdated: Date;
}

const FundSchema: Schema = new Schema({
  schemeCode: { type: String, required: true, unique: true, index: true },
  schemeName: { type: String, required: true },
  fundHouse: { type: String },
  schemeType: { type: String },
  schemeCategory: { type: String },
  navHistory: [{ date: Date, nav: Number }],
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.models.Fund || mongoose.model<IFund>('Fund', FundSchema);
