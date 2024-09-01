import { AccessTokenListItemDto, AccessTokenResponseDto, CreateAccessTokenDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class AccessTokenService extends BaseApiService<AccessTokenListItemDto> {
  constructor() {
    super("access-token");
  }

  async create(createAccessToken: CreateAccessTokenDto): Promise<AccessTokenResponseDto> {
    const response = (await this.getRestClient()).post<AccessTokenResponseDto>(
      `${this.resourcePath}/`,
      createAccessToken
    );
    return response;
  }
}

const accessTokenService = new AccessTokenService();
export { accessTokenService as AccessTokenService };
