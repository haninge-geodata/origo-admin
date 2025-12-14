import { MediaDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class MediaService extends BaseApiService<MediaDto> {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  sortMediaByName = (arrayToSort: MediaDto[]) => {
    return arrayToSort.sort((a, b) => {
      if (a.fieldname === b.fieldname) {
        return a.name.localeCompare(b.name);
      } else {
        return (a.fieldname === "folders" && b.fieldname !== "folders") ? -1 : 1;
      }
    });
  };

  async fetchByFolder(path: string = 'root'): Promise<MediaDto[]> {
    const restClient = await this.getRestClient();
    const sorted = this.sortMediaByName(await restClient.get<MediaDto[]>(`${this.resourcePath}/folder/${encodeURIComponent(path)}/uploads`));
    return sorted;
  }

  async upload(files: File[], path: string = 'root'): Promise<MediaDto[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("files", file);
    });

    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<MediaDto[]>(`${this.resourcePath}/upload${path === 'root' ? '' : `/${encodeURIComponent(path)}`}`, formData);
      return response;
    });
  }

  async renameFile(currentName: string, newName: string): Promise<MediaDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).put<MediaDto>(`${this.resourcePath}/upload/${encodeURIComponent(currentName)}/${encodeURIComponent(newName)}`);
      return response;
    });
  }

  async deleteFile(id: string): Promise<MediaDto> {
    return super.delete(id, "upload");
  }

  async createFolder(folderName: string): Promise<MediaDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<MediaDto>(`${this.resourcePath}/folder/${encodeURIComponent(folderName)}`);
      return response;
    });
  }

  async renameFolder(currentName: string, newName: string): Promise<MediaDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).put<MediaDto>(`${this.resourcePath}/folder/${encodeURIComponent(currentName)}/${encodeURIComponent(newName)}`);
      return response;
    });
  }

  async deleteFolder(id: string): Promise<MediaDto> {
    return super.delete(id, "folder");
  }
}

const mediaService = new MediaService("media");
export { mediaService as MediaService };
