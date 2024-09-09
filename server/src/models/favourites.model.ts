import mongoose from "mongoose";
import mongodb from "mongodb";

interface DBFavouriteseMap {
  _id: mongodb.ObjectId;
  name: string;
  user: string;
  data: object;
}

const favouritesSchema = new mongoose.Schema<DBFavouriteseMap>({
  data: { type: Object, required: true },
  name: { type: String, required: true },
  user: { type: String, required: true },
});

const FavouritesModel = mongoose.model<DBFavouriteseMap>(
  "Favourites",
  favouritesSchema
);

export { DBFavouriteseMap, FavouritesModel, favouritesSchema };
