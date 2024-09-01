import { IMapper } from "@/interfaces";
import { DBActor, DBPermission, DBRole } from "@/models/permission.model";
import { RoleDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

export class roleMapper implements IMapper<DBRole, RoleDto> {
  toDto(model: DBRole): RoleDto {
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

  toDBModel(dto: RoleDto, create: boolean): DBRole {
    const permissions: DBPermission[] = dto.permissions.map((permission) => ({
      _id: new mongoose.Types.ObjectId(permission.id),
      type: permission.type,
    }));

    const actors: DBActor[] = dto.actors.map((actor) => ({
      name: actor.name,
      type: actor.type,
    }));

    const dbRoleData: Partial<DBRole> = {
      role: dto.role,
      actors: actors,
      permissions: permissions,
    };

    if (!create) {
      dbRoleData._id = new mongoose.Types.ObjectId(dto.id);
    }

    return dbRoleData as DBRole;
  }
}
