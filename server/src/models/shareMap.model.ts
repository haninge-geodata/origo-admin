import mongoose from "mongoose";
import mongodb from "mongodb";

interface DBShareMap {
  _id: mongodb.ObjectId;
  name: string;
  user: string;
  data: object;
}

const shareMapSchema = new mongoose.Schema<DBShareMap>({
  data: { type: Object, required: true },
  name: { type: String, required: true },
  user: { type: String, required: true },
});

const ShareMapModel = mongoose.model<DBShareMap>("ShareMap", shareMapSchema);

export { DBShareMap, ShareMapModel, shareMapSchema };
