export interface RoleDto {
  id?: string;
  role: string;
  actors: ActorDto[];
  permissions: PermissionDto[];
}

export interface PermissionDto {
  id?: string;
  type: string;
}

export interface ActorDto {
  name: string;
  type: string;
}
