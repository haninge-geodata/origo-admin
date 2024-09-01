export interface ProxyRoleDto {
  id?: string;
  role: string;
  actors: ActorDto[];
  permissions: PermissionDto[];
}

interface PermissionDto {
  id?: string;
  type: string;
}

interface ActorDto {
  name: string;
  type: string;
}
