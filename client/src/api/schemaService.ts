import { BaseApiService } from "./baseService";
import { JsonSchemaDto } from "@/shared/interfaces/dtos";

class SchemaService extends BaseApiService<JsonSchemaDto> {
  constructor() {
    super("jsonschemas");
  }

  async fetchByName(name: string): Promise<JsonSchemaDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).get<JsonSchemaDto>(
        `${this.resourcePath}/by-name/${name}`
      );
      return response;
    });
  }

  async fetchVisible(): Promise<JsonSchemaDto[]> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).get<JsonSchemaDto[]>(
        `${this.resourcePath}/visible`
      );
      return response;
    });
  }

  async fetchMenuItems(): Promise<any[]> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).get<any[]>(
        `${this.resourcePath}/menu-items`
      );
      return response;
    });
  }
}

export const schemaService = new SchemaService();
export type { JsonSchemaDto };
