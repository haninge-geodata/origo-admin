import { MediaDto } from "@/shared/interfaces/dtos";

export interface IUploadService {
  getAllFiles(): Promise<MediaDto[]>;
  getMulterConfig(): any;
  saveFiles(files: Express.Multer.File[]): Promise<MediaDto[]>;
  deleteFile(id: string): Promise<void>;
}
