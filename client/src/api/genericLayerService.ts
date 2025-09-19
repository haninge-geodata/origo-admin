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
