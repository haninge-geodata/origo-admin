import { LinkResourceDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class LinkResourceService extends BaseApiService<LinkResourceDto> {
  constructor() {
    super("link-resources");
  }
  async fetchByType(type: string): Promise<LinkResourceDto[]> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).get<LinkResourceDto[]>(`${this.resourcePath}/type/${type}`);
      return response;
    });
  }
}

const linkResourceService = new LinkResourceService();
export { linkResourceService as LinkResourceService };
