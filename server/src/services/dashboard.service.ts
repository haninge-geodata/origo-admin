import { DashboardDto, LayerDto } from "@/shared/interfaces/dtos";
import { DBLayerBase, layerModel } from "@/models/layer.model";
import { MapInstanceService } from "./mapInstance.service";
import { LayerService } from "./layer.service";
import { LinkResourceService } from "./linkResource.service";
import { createLayerMapper } from "@/utils/layerMapperFactory";

class DashboardService {
  private mapInstanceService: MapInstanceService;
  private layersService: LayerService<DBLayerBase, LayerDto>;
  private linkResourceService: LinkResourceService;

  constructor() {
    this.mapInstanceService = new MapInstanceService();
    const mapper = createLayerMapper("ALL");
    const toDtoMethod = mapper.toDto.bind(mapper);
    const toDBModelMethod = mapper.toDBModel.bind(mapper);
    this.layersService = new LayerService<DBLayerBase, LayerDto>(layerModel, toDtoMethod, toDBModelMethod);
    this.linkResourceService = new LinkResourceService();
  }

  private buildSwaggerUrl(): string | undefined {
    const BASE_PATH = process.env.BASE_PATH;
    const SWAGGER_URL_SUFFIX = process.env.SWAGGER_URL_SUFFIX || "api-docs";
    const NODE_ENV = process.env.NODE_ENV || "development";
    const HOST = process.env.HOST || "localhost";
    const PORT = process.env.PORT || 3000;
    const PROTOCOL = process.env.PROTOCOL || (NODE_ENV === "development" ? "http" : "https");

    let swaggerPath = BASE_PATH ? `/${BASE_PATH}/${SWAGGER_URL_SUFFIX}`.replace(/\/+/g, "/") : `/${SWAGGER_URL_SUFFIX}`;

    if (NODE_ENV === "production") {
      return `${PROTOCOL}://${HOST}${swaggerPath}`;
    } else {
      return `${PROTOCOL}://${HOST}:${PORT}${swaggerPath}`;
    }
  }

  async findAll(id: string): Promise<DashboardDto> {
    let maps = await this.mapInstanceService.findAll();
    let publishedMaps = maps.filter((map) => map.isPublished);
    let unPublished = maps.filter((map) => !map.isPublished);
    let nrOfLayers = (await this.layersService.findAll()).length;
    let nrOfSources = (await this.linkResourceService.findAll()).length;

    const dashboard: DashboardDto = {
      publishedMaps: publishedMaps.length,
      unPublishedMaps: unPublished.length,
      layers: nrOfLayers,
      sources: nrOfSources,
      mapInstances: maps,
      swaggerUri: this.buildSwaggerUrl(),
    };

    return dashboard;
  }
}

export { DashboardService };
