import { Repository } from "@/repositories/Repository";
import { DBLayerBase, layerModel } from "@/models/layer.model";
import { IMapper } from "@/interfaces";
import { ProxyResourceDto, ProxyRoleDto } from "@/shared/interfaces/proxy";
import {
  proxyLayerMapper,
  proxySourceMapper,
  proxyControlMapper,
  proxyRoleMapper,
  proxyPublishedMapMapper,
} from "@/mappers/proxyMapper";
import {
  DBLinkResource,
  DBMapControl,
  DBRole,
  LinkResourceModel,
  MapControlModel,
  RoleModel,
} from "@/models";
import { DBPublishedMap, PublishedMapModel } from "@/models/publishedMap.model";

class ProxyService {
  private layerRepository: Repository<DBLayerBase>;
  private sourceRepository: Repository<DBLinkResource>;
  private controlRepository: Repository<DBMapControl>;
  private roleRepository: Repository<DBRole>;
  private publishedRepository: Repository<DBPublishedMap>;

  private proxyLayerMapper: IMapper<DBLayerBase, ProxyResourceDto>;
  private proxySourceMapper: IMapper<DBLinkResource, ProxyResourceDto>;
  private proxyPublishedMapMapper: IMapper<DBPublishedMap, ProxyResourceDto>;
  private proxyControlMapper: IMapper<DBMapControl, ProxyResourceDto>;
  private proxyRoleMapper: IMapper<DBRole, ProxyRoleDto>;
  constructor() {
    this.publishedRepository = new Repository<DBPublishedMap>(
      PublishedMapModel
    );
    this.layerRepository = new Repository<DBLayerBase>(layerModel);
    this.sourceRepository = new Repository<DBLinkResource>(LinkResourceModel);
    this.controlRepository = new Repository<DBMapControl>(MapControlModel);
    this.roleRepository = new Repository<DBRole>(RoleModel);

    this.proxyLayerMapper = new proxyLayerMapper();
    this.proxySourceMapper = new proxySourceMapper();
    this.proxyControlMapper = new proxyControlMapper();
    this.proxyPublishedMapMapper = new proxyPublishedMapMapper();
    this.proxyRoleMapper = new proxyRoleMapper();
  }

  async getAllResources(): Promise<ProxyResourceDto[]> {
    let layers = await this.layerRepository.findAll();
    let sources = await this.sourceRepository.findAll();
    let controls = await this.controlRepository.findAll();
    let maps = await this.publishedRepository.findAll();
    let dtos = layers.map((item) => this.proxyLayerMapper.toDto(item));
    dtos = dtos.concat(
      sources.map((item) => this.proxySourceMapper.toDto(item))
    );
    dtos = dtos.concat(
      controls.map((item) => this.proxyControlMapper.toDto(item))
    );
    dtos = dtos.concat(
      maps.map((item) => this.proxyPublishedMapMapper.toDto(item))
    );
    return dtos;
  }

  async getAllRoles(): Promise<ProxyRoleDto[]> {
    let response = await this.roleRepository.findAll();
    return response.map((item) => this.proxyRoleMapper.toDto(item));
  }
}

export { ProxyService };
