import { MediaDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class MediaService extends BaseApiService<MediaDto> {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  sortMediaByName = (arrayToSort: MediaDto[]) => {
    return arrayToSort.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  };

  async fetchAll(): Promise<MediaDto[]> {
    const sortedFolders = this.sortMediaByName(await super.fetchAll("folder"));
    const sortedFiles = this.sortMediaByName(await super.fetchAll("upload"));
    return sortedFolders.concat(sortedFiles);
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

  async renameFile(currentName: string, newName: string): Promise<MediaDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).put<MediaDto>(`${this.resourcePath}/upload/${currentName}/${newName}`);
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

  async renameFolder(currentName: string, newName: string): Promise<MediaDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).put<MediaDto>(`${this.resourcePath}/folder/${currentName}/${newName}`);
      return response;
    });
  }

  async deleteFolder(id: string): Promise<MediaDto> {
    return super.delete(id, "folder");
  }
}

const mediaService = new MediaService("media");
export { mediaService as MediaService };
