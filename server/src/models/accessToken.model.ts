import mongoose, { Document, Schema, model } from "mongoose";

interface DBAccessToken {
  _id: mongoose.Types.ObjectId;
  tokenId: string;
  name: string;
  createdDate?: Date;
  expiresAt: Date;
  isValid: boolean;
  permissions?: string[];
}

const AccessTokenSchema = new Schema<DBAccessToken>({
  _id: { type: Schema.Types.ObjectId, required: true },
  tokenId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isValid: { type: Boolean, default: true },
  permissions: { type: [String], required: true },
});
AccessTokenSchema.index({ tokenId: 1 });

const AccessTokenModel = model<DBAccessToken>("AccessTokens", AccessTokenSchema);
export { DBAccessToken, AccessTokenModel };
