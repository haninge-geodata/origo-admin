import { IMapper } from "@/interfaces";
import { DBShareMap } from "@/models/shareMap.model";
import { ShareMapDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

export default class ShareMapMapper implements IMapper<DBShareMap, ShareMapDto> {
  toDto(model: DBShareMap): ShareMapDto {
    return {
      id: model._id.toHexString(),
      name: model.name,
      user: model.user,
      data: model.data,
    };
  }
  toDBModel(dto: ShareMapDto, create: boolean = false): DBShareMap {
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
