import mongoose from "mongoose";
import mongodb from "mongodb";

interface DBMapControl {
  _id: mongodb.ObjectId;
  control: Object;
  title: string;
}

const mapControlSchema = new mongoose.Schema<DBMapControl>({
  control: { type: Object, required: true },
  title: { type: String, required: true },
});

const MapControlModel = mongoose.model<DBMapControl>("MapControl", mapControlSchema);

export { DBMapControl, MapControlModel, mapControlSchema };
