import { IMapper } from "@/interfaces";
import { DBLinkResource } from "@/models";
import { DBLayerBase } from "@/models/layer.model";
import { ProxyLayerDto, ProxyRoleDto } from "@/shared/interfaces/proxy";
import { DBRole } from "@/models/permission.model";
import { linkResourceMapper } from "@/mappers/linkResourceMapper";
import { LinkResourceDto } from "@/shared/interfaces/dtos";

class proxyLayerMapper implements IMapper<DBLayerBase, ProxyLayerDto> {
  private _linkResourceMapper: IMapper<DBLinkResource, LinkResourceDto>;

  constructor() {
    this._linkResourceMapper = new linkResourceMapper();
  }
  toDto(model: DBLayerBase): ProxyLayerDto {
    const src = this._linkResourceMapper.toDto(model.source as DBLinkResource);
    return {
      type: "layer",
      id: model._id.toString(),
      name: model.name,
      sourceId: src.id!,
      source: src.name,
      sourceUrl: src.url,
    };
  }
  toDBModel(dto: ProxyLayerDto, create?: boolean | undefined): DBLayerBase {
    throw new Error("Method not implemented since it is not needed for this mapper");
  }
}

export class proxyRoleMapper implements IMapper<DBRole, ProxyRoleDto> {
  toDto(model: DBRole): ProxyRoleDto {
    return {
      id: model._id.toString(),
      role: model.role,
      actors: model.actors.map((actor) => ({
        name: actor.name,
        type: actor.type,
      })),
      permissions: model.permissions.map((permission) => ({
        id: permission._id.toString(),
        type: permission.type,
      })),
    };
  }
  toDBModel(dto: ProxyRoleDto, create?: boolean): DBRole {
    throw new Error("Method not implemented since it is not needed for this mapper");
  }
}

export { proxyLayerMapper };
