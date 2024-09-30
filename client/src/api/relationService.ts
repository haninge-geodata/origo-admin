import { RelationDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class RelationService extends BaseApiService<RelationDto> {
  constructor() {
    super("relations");
  }

  async fetchRelations(id: string, findIn: string, path: string): Promise<RelationDto[]> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).get<RelationDto[]>(`${this.resourcePath}/${id}/${findIn}/${path}`);
      return response;
    });
  }
}

const relationService = new RelationService();
export { relationService as RelationService };
