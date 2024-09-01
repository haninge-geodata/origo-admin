import mongoose from "mongoose";
import mongodb from "mongodb";

interface DBMapSetting {
  _id: mongodb.ObjectId;
  setting: Object;
  title: string;
}

const mapSettingSchema = new mongoose.Schema<DBMapSetting>({
  setting: { type: Object, required: true },
  title: { type: String, required: true },
});

const MapSettingModel = mongoose.model<DBMapSetting>("MapSetting", mapSettingSchema);

export { DBMapSetting, MapSettingModel, mapSettingSchema };
