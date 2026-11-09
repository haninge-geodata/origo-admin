import { IMapper } from "@/interfaces";
import { DBJsonSchema } from "@/models/jsonSchema.model";
import { JsonSchemaDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

export class JsonSchemaMapper implements IMapper<DBJsonSchema, JsonSchemaDto> {
  toDto(model: DBJsonSchema): JsonSchemaDto {
    return {
      id: model._id.toString(),
      name: model.name,
      title: model.title,
      schemaContent: model.schemaContent,
      visible: model.visible,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
    };
  }

  toDBModel(dto: JsonSchemaDto, create: boolean = false): DBJsonSchema {
    const dbModelData: any = {
      name: dto.name,
      title: dto.title,
      schemaContent: dto.schemaContent,
      visible: dto.visible,
    };

    const dbModel = new (require("@/models/jsonSchema.model").JsonSchemaModel)(
      dbModelData
    );

    if (!create && dto.id) {
      dbModel._id = new mongoose.Types.ObjectId(dto.id);
    }

    return dbModel;
  }
}

export const jsonSchemaMapper = new JsonSchemaMapper();
