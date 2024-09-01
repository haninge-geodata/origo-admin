import { IMapper } from "@/interfaces";
import { DBAccessToken } from "@/models";
import { CreateAccessTokenDto, AccessTokenResponseDto, AccessTokenListItemDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

class createAccessTokenMapper implements IMapper<DBAccessToken, CreateAccessTokenDto> {
  toDto(model: DBAccessToken): CreateAccessTokenDto {
    throw new Error("Method not implemented since it is not needed for this mapper");
  }
  toDBModel(dto: CreateAccessTokenDto): DBAccessToken {
    return {
      _id: new mongoose.Types.ObjectId(),
      tokenId: "",
      name: dto.name,
      expiresAt: dto.expiresAt,
      isValid: true,
      permissions: dto.permissions,
    };
  }
}

class createAccessTokenResponseMapper implements IMapper<DBAccessToken, AccessTokenResponseDto> {
  toDto(model: DBAccessToken): AccessTokenResponseDto {
    return {
      token: model._id.toString(),
      id: model._id.toString(),
      name: model.name,
      expiresAt: model.expiresAt,
    };
  }
  toDBModel(dto: AccessTokenResponseDto): DBAccessToken {
    throw new Error("Method not implemented since it is not needed for this mapper");
  }
}

class AccessTokenListItemMapper implements IMapper<DBAccessToken, AccessTokenListItemDto> {
  toDto(model: DBAccessToken): AccessTokenListItemDto {
    return {
      id: model._id.toString(),
      name: model.name,
      createdDate: model.createdDate!,
      expiresAt: model.expiresAt,
      isValid: model.isValid,
      permissions: model.permissions === undefined ? [] : model.permissions,
    };
  }
  toDBModel(dto: AccessTokenListItemDto): DBAccessToken {
    throw new Error("Method not implemented since it is not needed for this mapper");
  }
}

export { createAccessTokenMapper, createAccessTokenResponseMapper, AccessTokenListItemMapper };
