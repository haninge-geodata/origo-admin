import { IMapper } from "@/interfaces";
import { DBFavouriteseMap } from "@/models/favourites.model";
import { FavouritesDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

export default class FavouritesMapMapper
  implements IMapper<DBFavouriteseMap, FavouritesDto>
{
  toDto(model: DBFavouriteseMap): FavouritesDto {
    return {
      id: model._id.toHexString(),
      name: model.name,
      user: model.user,
      data: model.data,
    };
  }
  toDBModel(dto: FavouritesDto, create: boolean = false): DBFavouriteseMap {
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
