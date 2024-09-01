import { IMapper } from "@/interfaces";
import { DBMapSetting } from "@/models";
import { MapSettingDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

export default class MapSettingMapper implements IMapper<DBMapSetting, MapSettingDto> {
  toDto(model: DBMapSetting): MapSettingDto {
    return {
      id: model._id.toHexString(),
      title: model.title,
      setting: model.setting,
    };
  }
  toDBModel(dto: MapSettingDto, create: boolean = false): DBMapSetting {
    const dbMapSetting = {
      _id: new mongoose.Types.ObjectId(dto.id),
      title: dto.title,
      setting: dto.setting,
    };

    if (!create) {
      dbMapSetting._id = new mongoose.Types.ObjectId(dto.id);
    }

    return dbMapSetting;
  }
}
