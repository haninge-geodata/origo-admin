import mongoose from "mongoose";
import mongodb from "mongodb";

interface DBMedia {
  _id: mongodb.ObjectId;
  name: string;
  filename: string;
  mimetype: string;
  fieldname: string;
  size: number;
}

const mediaSchema = new mongoose.Schema<DBMedia>({
  name: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  fieldname: { type: String, required: true },
  size: { type: Number, required: true },
});

const MediaModel = mongoose.model<DBMedia>("media", mediaSchema);

export { DBMedia, MediaModel, mediaSchema };
