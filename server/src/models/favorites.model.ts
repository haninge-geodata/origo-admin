import mongoose from "mongoose";
import mongodb from "mongodb";

interface DBFavoriteseMap {
  _id: mongodb.ObjectId;
  name: string;
  user: string;
  data: object;
}

const favoritesSchema = new mongoose.Schema<DBFavoriteseMap>({
  data: { type: Object, required: true },
  name: { type: String, required: true },
  user: { type: String, required: true },
});

const FavoritesModel = mongoose.model<DBFavoriteseMap>(
  "Favorites",
  favoritesSchema
);

export { DBFavoriteseMap, FavoritesModel, favoritesSchema };
