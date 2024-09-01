import { Repository } from "@/repositories/Repository";
import { DBLayerBase, layerModel } from "@/models/layer.model";
import { IMapper } from "@/interfaces";
import { ProxyLayerDto, ProxyRoleDto } from "@/shared/interfaces/proxy";
import { proxyLayerMapper, proxyRoleMapper } from "@/mappers/proxyMapper";
import { DBRole, RoleModel } from "@/models";
import { DBPublishedMap, PublishedMapModel } from "@/models/publishedMap.model";

class ProxyService {
  private layerRepository: Repository<DBLayerBase>;
  private roleRepository: Repository<DBRole>;
  private publishedRepository: Repository<DBPublishedMap>;

  private proxyLayerMapper: IMapper<DBLayerBase, ProxyLayerDto>;
  private proxyRoleMapper: IMapper<DBRole, ProxyRoleDto>;
  constructor() {
    this.publishedRepository = new Repository<DBPublishedMap>(PublishedMapModel);
    this.layerRepository = new Repository<DBLayerBase>(layerModel);
    this.roleRepository = new Repository<DBRole>(RoleModel);

    this.proxyLayerMapper = new proxyLayerMapper();
    this.proxyRoleMapper = new proxyRoleMapper();
  }

  async getAllResources(): Promise<ProxyLayerDto[]> {
    var response = await this.layerRepository.findAll();
    let dtos = response.map((item) => this.proxyLayerMapper.toDto(item));
    return dtos;
  }

  async getAllRoles(): Promise<ProxyRoleDto[]> {
    var response = await this.roleRepository.findAll();
    return response.map((item) => this.proxyRoleMapper.toDto(item));
  }

  private async getAllInstances(): Promise<DBPublishedMap[]> {
    return this.publishedRepository.findAll();
  }
}

export { ProxyService };
