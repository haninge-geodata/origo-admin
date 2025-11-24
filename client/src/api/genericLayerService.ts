import { BaseLayerDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class GenericLayerService extends BaseApiService<BaseLayerDto> {
  private schemaType: string;

  constructor(schemaType: string) {
    super(`layers/${schemaType.toLowerCase()}`);
    this.schemaType = schemaType;
  }

  async duplicate(id: string): Promise<BaseLayerDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<BaseLayerDto>(
        `${this.resourcePath}/duplicate/${id}`
      );
      return response;
    });
  }

  /**
   * Create a single layer with validation by default
   * @param resource - The layer data
   * @param skipValidation - If true, skips validation (validation is on by default)
   */
  async add(resource: BaseLayerDto, skipValidation: boolean = false): Promise<BaseLayerDto> {
    return this.executeWithEvents(async () => {
      const url = skipValidation 
        ? `${this.resourcePath}?skipValidation=true` 
        : this.resourcePath;
      const response = (await this.getRestClient()).post<BaseLayerDto>(url, resource);
      return response;
    });
  }

  /**
   * Create multiple layers with validation by default
   * @param resources - Array of layer data
   * @param skipValidation - If true, skips validation (validation is on by default)
   */
  async addRange(resources: BaseLayerDto[], skipValidation: boolean = false): Promise<BaseLayerDto[]> {
    return this.executeWithEvents(async () => {
      const url = skipValidation 
        ? `${this.resourcePath}?skipValidation=true` 
        : this.resourcePath;
      const response = (await this.getRestClient()).post<BaseLayerDto[]>(url, resources);
      return response;
    });
  }

  /**
   * Update a layer with validation by default
   * @param id - The layer ID
   * @param resource - The updated layer data
   * @param skipValidation - If true, skips validation (validation is on by default)
   */
  async update(id: string, resource: BaseLayerDto, skipValidation: boolean = false): Promise<BaseLayerDto> {
    return this.executeWithEvents(async () => {
      const url = skipValidation 
        ? `${this.resourcePath}/${id}?skipValidation=true` 
        : `${this.resourcePath}/${id}`;
      const response = (await this.getRestClient()).put<BaseLayerDto>(url, resource);
      return response;
    });
  }

  getSchemaType(): string {
    return this.schemaType;
  }
}

//TODO: Add remove fn!
export const createGenericLayerService = (
  schemaType: string
): GenericLayerService => {
  return new GenericLayerService(schemaType);
};

export { GenericLayerService };
