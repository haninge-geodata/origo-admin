import { IMapper } from "@/interfaces";
import { DBLinkResource, DBStyleSchema } from "@/models";
import { DBDynamicLayer, layerModel } from "@/models/layer.model";
import {
  DynamicLayerDto,
  LinkResourceDto,
  StyleSchemaDto,
} from "@/shared/interfaces/dtos";
import mongoose from "mongoose";
import { linkResourceMapper } from "@/mappers/linkResourceMapper";
import StyleSchemaMapper from "./styleSchemaMapper";

export class DynamicLayerMapper
  implements IMapper<DBDynamicLayer, DynamicLayerDto>
{
  protected _linkResourceMapper: IMapper<DBLinkResource, LinkResourceDto>;
  protected _styleSchemaMapper: IMapper<DBStyleSchema, StyleSchemaDto>;

  private readonly BASE_PROPERTY_NAMES = [
    "id",
    "_id",
    "name",
    "title",
    "type",
    "source",
    "style",
    "layer_id",
    "abstract",
    "extendedAttributes",
  ];

  private readonly STYLE_REFERENCE_FIELDS = ["clusterStyle"];

  constructor() {
    this._linkResourceMapper = new linkResourceMapper();
    this._styleSchemaMapper = new StyleSchemaMapper();
  }

  toDto(model: DBDynamicLayer): DynamicLayerDto {
    const doc = (model as any)._doc || model;
    const dto: DynamicLayerDto = {
      id: model._id.toString(),
      name: model.name,
      title: model.title,
      type: model.type,
    };

    if (model.layer_id) dto.layer_id = model.layer_id;

    // Source is flexible - could be a string (URL), ObjectId reference, or anything
    if (model.source !== undefined && model.source !== null) {
      // If it's an ObjectId reference that got populated, convert it
      if (typeof model.source === "object" && model.source._id) {
        dto.source = this._linkResourceMapper.toDto(
          model.source as DBLinkResource
        );
      } else {
        // Otherwise, use it as-is (string URL, plain object, etc.)
        dto.source = model.source;
      }
    }

    if (model.abstract) dto.abstract = model.abstract;

    // Style is also flexible - could be a string, ObjectId reference, or anything
    if (model.style !== undefined && model.style !== null) {
      // If it's an ObjectId reference that got populated, convert it
      if (typeof model.style === "object" && model.style._id) {
        dto.style = this._styleSchemaMapper.toDto(model.style as DBStyleSchema);
      } else {
        // Otherwise, use it as-is (string, plain object, etc.)
        dto.style = model.style;
      }
    }

    if (model.extendedAttributes) {
      dto.extendedAttributes = model.extendedAttributes;
    }

    // Use _doc to access the actual document data, as Mongoose wraps documents
    // Flatten dynamicProperties to top level for consistent API structure
    const dynamicProps = doc.dynamicProperties || model.dynamicProperties;

    if (dynamicProps) {
      Object.keys(dynamicProps).forEach((key) => {
        const value = dynamicProps[key];

        if (this.STYLE_REFERENCE_FIELDS.includes(key) && value) {
          if (mongoose.Types.ObjectId.isValid(value)) {
            dto[key] = value.toString();
          } else {
            dto[key] = value;
          }
        } else {
          dto[key] = value;
        }
      });
    }

    return dto;
  }

  toDBModel(dto: DynamicLayerDto, create: boolean = false): DBDynamicLayer {
    const dbModelData: any = {
      name: dto.name,
      title: dto.title,
      type: dto.type,
    };

    if (dto.layer_id) dbModelData.layer_id = dto.layer_id;

    // Source is flexible - handle different types
    if (dto.source !== undefined && dto.source !== null) {
      if (typeof dto.source === "string") {
        // String URL - store as-is
        dbModelData.source = dto.source;
      } else if (typeof dto.source === "object" && dto.source.id) {
        // Object from ApiSelect (LinkResourceDto) - convert to ObjectId reference
        dbModelData.source = new mongoose.Types.ObjectId(dto.source.id);
      } else {
        // Any other format - store as-is
        dbModelData.source = dto.source;
      }
    }

    if (dto.abstract !== undefined) dbModelData.abstract = dto.abstract;

    // Style is also flexible - handle different types
    if (dto.style !== undefined && dto.style !== null) {
      if (typeof dto.style === "string") {
        // String reference - store as-is
        dbModelData.style = dto.style;
      } else if (typeof dto.style === "object" && dto.style.id) {
        // Object from ApiSelect (StyleSchemaDto) - convert to ObjectId reference
        dbModelData.style = new mongoose.Types.ObjectId(dto.style.id);
      } else {
        // Any other format - store as-is
        dbModelData.style = dto.style;
      }
    }

    if (dto.extendedAttributes) {
      dbModelData.extendedAttributes = dto.extendedAttributes;
    }

    const dynamicProps: any = {};
    Object.keys(dto).forEach((key) => {
      if (!this.BASE_PROPERTY_NAMES.includes(key)) {
        const value = dto[key];

        if (this.STYLE_REFERENCE_FIELDS.includes(key) && value) {
          if (typeof value === "string") {
            dynamicProps[key] = new mongoose.Types.ObjectId(value);
          } else if (typeof value === "object" && value.id) {
            dynamicProps[key] = new mongoose.Types.ObjectId(value.id);
          } else {
            dynamicProps[key] = value;
          }
        } else {
          dynamicProps[key] = value;
        }
      }
    });

    if (Object.keys(dynamicProps).length > 0) {
      dbModelData.dynamicProperties = dynamicProps;
    }

    const dbModel = new layerModel(dbModelData) as DBDynamicLayer;

    if (!create && dto.id) {
      dbModel._id = new mongoose.Types.ObjectId(dto.id);
    }

    return dbModel;
  }
}
