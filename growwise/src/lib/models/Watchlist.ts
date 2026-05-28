import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchlist extends Document {
  userId: Schema.Types.ObjectId;
  schemeCodes: string[];
}

const WatchlistSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  schemeCodes: [{ type: String }],
});

export default mongoose.models.Watchlist || mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
