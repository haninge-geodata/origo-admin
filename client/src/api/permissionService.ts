import { RoleDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class PermissionService extends BaseApiService<RoleDto> {
  constructor() {
    super("permissions/roles");
  }
  async duplicate(id: string): Promise<RoleDto> {
    const response = (await this.getRestClient()).post<RoleDto>(`${this.resourcePath}/duplicate/${id}`);
    return response;
  }
}

const permissionService = new PermissionService();
export { permissionService as PermissionService };
