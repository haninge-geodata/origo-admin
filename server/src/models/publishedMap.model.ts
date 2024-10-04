import mongoose, { Document } from "mongoose";
import mongodb from "mongodb";
import { PublishedMapConfigDto } from "@/shared/interfaces/dtos";

interface DBPublishedMap extends Document {
  _id: mongodb.ObjectId;
  mapInstanceId: mongodb.ObjectId;
  title: string;
  name: string;
  abstract: string;
  publishedDate: Date;
  map: PublishedMapConfigDto;
}

const publishedMapSchema = new mongoose.Schema<DBPublishedMap>({
  title: { type: String, required: true },
  mapInstanceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  publishedDate: { type: Date, required: true },
  name: { type: String, required: true },
  abstract: { type: String, required: false },
  map: { type: Object, required: true },
});

const PublishedMapModel = mongoose.model<DBPublishedMap>("PublishedMap", publishedMapSchema);

export { DBPublishedMap, PublishedMapModel, publishedMapSchema };
