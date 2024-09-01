import { IMapper } from "@/interfaces";
import {
  AccessTokenListItemMapper,
  createAccessTokenMapper,
  createAccessTokenResponseMapper,
} from "@/mappers/accessTokenMapper";
import { DBAccessToken, AccessTokenModel } from "@/models";
import { Repository } from "@/repositories/Repository";
import { AccessTokenListItemDto, AccessTokenResponseDto, CreateAccessTokenDto } from "@/shared/interfaces/dtos";
import { TokenUtils } from "@/utils/accessTokenUtils";

class AccessTokenService {
  private repository: Repository<DBAccessToken>;
  private listItemMapper: IMapper<DBAccessToken, AccessTokenListItemDto>;
  private createMapper: IMapper<DBAccessToken, CreateAccessTokenDto>;
  private createResponseMapper: IMapper<DBAccessToken, AccessTokenResponseDto>;
  constructor() {
    this.repository = new Repository<DBAccessToken>(AccessTokenModel);
    this.listItemMapper = new AccessTokenListItemMapper();
    this.createMapper = new createAccessTokenMapper();
    this.createResponseMapper = new createAccessTokenResponseMapper();
  }

  async findAll(): Promise<AccessTokenListItemDto[]> {
    let response = await this.repository.query({ isValid: true });
    return response.map((item) => this.listItemMapper.toDto(item));
  }

  async create(createAccessTokenDto: CreateAccessTokenDto): Promise<AccessTokenResponseDto> {
    const tokenId = TokenUtils.generateTokenId();
    const token = TokenUtils.generateAccessToken(
      tokenId,
      createAccessTokenDto.expiresAt,
      createAccessTokenDto.permissions
    );
    const dbModel = this.createMapper.toDBModel(createAccessTokenDto);
    dbModel.tokenId = tokenId;

    let createdToken = await this.repository.create(dbModel);
    let responseDto = this.createResponseMapper.toDto(createdToken);

    return {
      ...responseDto,
      token: token,
    };
  }

  async delete(id: string): Promise<void> {
    let token = await this.repository.find(id);
    token.isValid = false;
    await this.repository.update(id, token);
  }
}

export { AccessTokenService };
