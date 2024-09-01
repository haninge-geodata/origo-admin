export interface CreateAccessTokenDto {
  name: string;
  expiresAt: Date;
  permissions: string[];
}

export interface AccessTokenResponseDto {
  token: string;
  id: string;
  name: string;
  expiresAt: Date;
}

export interface AccessTokenListItemDto {
  id: string;
  name: string;
  createdDate: Date;
  expiresAt: Date;
  isValid: boolean;
  permissions: string[];
}
