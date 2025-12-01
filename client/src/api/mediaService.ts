import { MediaDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class MediaService extends BaseApiService<MediaDto> {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  async upload(files: File[]): Promise<MediaDto[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("files", file);
    });

    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<MediaDto[]>(`${this.resourcePath}/upload`, formData);
      return response;
    });
  }

  async deleteFile(id: string): Promise<MediaDto> {
    return super.delete(id, "upload");
  }

  async createFolder(folderName: string): Promise<MediaDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<MediaDto>(`${this.resourcePath}/folder/${folderName}`);
      return response;
    });
  }

  async deleteFolder(id: string): Promise<MediaDto> {
    return super.delete(id, "folder");
  }
}

const mediaService = new MediaService("media");
export { mediaService as MediaService };
