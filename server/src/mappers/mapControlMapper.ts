import { IMapper } from "@/interfaces";
import { DBMapControl } from "@/models";
import { MapControlDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

export default class MapControlMapper implements IMapper<DBMapControl, MapControlDto> {
  toDto(model: DBMapControl): MapControlDto {
    const dto = {
      id: model._id.toHexString(),
      title: model.title,
      control: model.control,
    };
    return dto;
  }
  toDBModel(dto: MapControlDto, create: boolean = false): DBMapControl {
    const dbMapControl = {
      _id: new mongoose.Types.ObjectId(dto.id),
      title: dto.title,
      control: dto.control,
    };

    if (!create) {
      dbMapControl._id = new mongoose.Types.ObjectId(dto.id);
    }
    return dbMapControl;
  }
}
