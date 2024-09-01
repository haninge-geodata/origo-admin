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
    const response = (await this.getRestClient()).post<MediaDto[]>(`${this.resourcePath}`, formData);
    return response;
  }
}

const mediaService = new MediaService("media/upload");
export { mediaService as MediaService };
