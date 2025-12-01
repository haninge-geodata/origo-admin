import { MediaDto } from "@/shared/interfaces/dtos";

export interface IUploadService {
  getAllFiles(): Promise<MediaDto[]>;
  getFileByIdOrFilename(id: string): Promise<MediaDto>;
  getMulterConfig(): any;
  saveFiles(files: Express.Multer.File[]): Promise<MediaDto[]>;
  deleteFile(id: string): Promise<MediaDto>;
}
