import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: 'Company Head' | 'Admin' | 'Seller' | 'Customer';
  parentId?: Schema.Types.ObjectId; // To link Seller to Admin, Admin to Company Head
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['Company Head', 'Admin', 'Seller', 'Customer'],
    required: true,
  },
  parentId: { type: Schema.Types.ObjectId, ref: 'User' },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
