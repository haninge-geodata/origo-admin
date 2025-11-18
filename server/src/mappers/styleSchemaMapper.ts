import { DBStyleSchema } from "@/models";
import {
  CustomStyleDto,
  IconStyleDto,
  StyleSchemaDto,
  StyleType,
} from "@/shared/interfaces/dtos";
import { v4 as uuidv4 } from "uuid";

import mongoose from "mongoose";
import { IMapper } from "@/interfaces";

export default class StyleSchemaMapper
  implements IMapper<DBStyleSchema, StyleSchemaDto>
{
  toDto(model: DBStyleSchema): StyleSchemaDto {
    return {
      id: model._id.toHexString(),
      name: model.name,
      styles: model.styles
        ? model.styles.map((row) =>
            row.map((styleItem) => {
              if (isIconStyleDto(styleItem)) {
                let item = styleItem as IconStyleDto;
                return item;
              } else if (isCustomStyleDto(styleItem)) {
                let item = styleItem as CustomStyleDto;
                return item;
              }
              throw new Error("Okänd styleItem-typ.");
            })
          )
        : [],
    };
  }
  toDBModel(dto: StyleSchemaDto, create: boolean = false): DBStyleSchema {
    const dbStyleSchema: Partial<DBStyleSchema> = {
      name: dto.name,
      styles: dto.styles,
    };

    if (!create) {
      dbStyleSchema._id = new mongoose.Types.ObjectId(dto.id);
    }
    if (create) {
      dbStyleSchema.styles = dbStyleSchema.styles?.map((row) =>
        row.map((styleItem) => {
          styleItem.id = uuidv4();
          return styleItem;
        })
      );
    }
    return dbStyleSchema as DBStyleSchema;
  }
}

function isIconStyleDto(styleItem: any): styleItem is IconStyleDto {
  return styleItem.type === StyleType.Icon;
}

function isCustomStyleDto(styleItem: any): styleItem is CustomStyleDto {
  return styleItem.type === StyleType.Custom;
}
