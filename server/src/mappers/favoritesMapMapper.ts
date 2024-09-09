import { IMapper } from "@/interfaces";
import { DBFavoriteseMap } from "@/models/favorites.model";
import { FavoritesDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

export default class FavoritesMapMapper
  implements IMapper<DBFavoriteseMap, FavoritesDto>
{
  toDto(model: DBFavoriteseMap): FavoritesDto {
    return {
      id: model._id.toHexString(),
      name: model.name,
      user: model.user,
      data: model.data,
    };
  }
  toDBModel(dto: FavoritesDto, create: boolean = false): DBFavoriteseMap {
    const dbMapControl = {
      _id: new mongoose.Types.ObjectId(dto.id),
      name: dto.name,
      user: dto.user,
      data: dto.data,
    };

    if (!create) {
      dbMapControl._id = new mongoose.Types.ObjectId(dto.id);
    }

    return dbMapControl;
  }
}
