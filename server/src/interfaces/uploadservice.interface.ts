import { MediaDto } from "@/shared/interfaces/dtos";

export interface IUploadService {
  getMulterConfig(): any;
  getAllFiles(): Promise<MediaDto[]>;
  getFileByIdOrFilename(id: string): Promise<MediaDto>;
  saveFiles(files: Express.Multer.File[]): Promise<MediaDto[]>;
  renameFile(currentFilename: string, newFilename: string): Promise<MediaDto>;
  deleteFile(id: string): Promise<MediaDto>;
  getAllFolders(): Promise<MediaDto[]>;
  getFolderByIdOrFolderName(id: string): Promise<MediaDto>;
  createFolder(folderName: string): Promise<MediaDto>;
  renameFolder(currentFolderName: string, newFolderName: string): Promise<MediaDto>;
  deleteFolder(id: string): Promise<MediaDto>;
}
