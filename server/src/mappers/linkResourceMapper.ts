import { DBLinkResource } from "@/models";
import { LinkResourceDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";
import { IMapper } from "@/interfaces";
export class linkResourceMapper
  implements IMapper<DBLinkResource, LinkResourceDto>
{
  toDto(model: DBLinkResource): LinkResourceDto {
    const dto = {
      id: model._id.toHexString(),
      name: model.name,
      title: model.title,
      url: model.url,
      type: model.type,
      extendedAttributes: [],
    } as LinkResourceDto;

    if (model.extendedAttributes && model.extendedAttributes.length > 0) {
      dto.extendedAttributes = model.extendedAttributes.map((attr) => ({
        key: attr.key,
        value: attr.value,
      }));
    }
    return dto;
  }
  toDBModel(dto: LinkResourceDto, create: boolean = false): DBLinkResource {
    const dbLinkResource = {
      _id: new mongoose.Types.ObjectId(dto.id),
      name: dto.name,
      title: dto.title,
      url: dto.url,
      type: dto.type,
      extendedAttributes: [],
    } as DBLinkResource;

    if (dto.extendedAttributes && dto.extendedAttributes.length > 0) {
      dbLinkResource.extendedAttributes = dto.extendedAttributes.map(
        (attr) => ({
          key: attr.key,
          value: attr.value,
        })
      );
    }

    if (!create) {
      dbLinkResource._id = new mongoose.Types.ObjectId(dto.id);
    }

    return dbLinkResource;
  }
}
