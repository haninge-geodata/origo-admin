import multer, { StorageEngine } from "multer";
import path from "path";
import { Request } from "express";
import * as dotevnv from "dotenv";
import { mapMulterFileToDBMedia, mapDBMediaToMediaDto } from "@/mappers/";
import { Repository } from "@/repositories/Repository";
import { DBMedia, MediaModel } from "@/models";
import { MediaDto } from "@/shared/interfaces/dtos";
import { BlobServiceClient } from "@azure/storage-blob";
import { IUploadService } from "@/interfaces/uploadservice.interface";

dotevnv.config();
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME!;

class AzureUploadService implements IUploadService {
  private uploadPath = process.env.UPLOAD_PATH!;
  private repository: Repository<DBMedia>;

  constructor() {
    this.repository = new Repository<DBMedia>(MediaModel);
  }

  async getAllFiles(): Promise<MediaDto[]> {
    try {
      const files = await this.repository.findAll();
      return files.map((file) => mapDBMediaToMediaDto(file, this.uploadPath));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get media registrations");
    }
  }

  async getFileByIdOrFilename(id: string): Promise<MediaDto> {
    try {
      const file = (await this.repository.query({ $or: [ { _id: id }, { filename: id } ] }, null, 1))[0];
      return mapDBMediaToMediaDto(file, this.uploadPath);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get the media registration");
    }
  }

  private async uploadToAzure(file: Express.Multer.File): Promise<string> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient =
      blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return blockBlobClient.url;
  }

  private async deleteFileFromAzure(filename: string): Promise<void> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient =
      blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(filename);
    await blobClient.delete();
  }

  async saveFiles(files: Express.Multer.File[]): Promise<MediaDto[]> {
    const promises = files.map(async (file) => {
      const fileData = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        pathOrUrl: await this.uploadToAzure(file),
      };

      const dbMedia = mapMulterFileToDBMedia(file);
      const parts = fileData.pathOrUrl.split("/");
      const filename = parts[parts.length - 1];

      dbMedia.filename = filename;
      return await this.repository.create(dbMedia);
    });

    const createdFiles = await Promise.all(promises);
    return createdFiles.map((file) =>
      mapDBMediaToMediaDto(file, this.uploadPath)
    );
  }

  async deleteFile(id: string): Promise<MediaDto> {
    const file = await this.repository.find(id);
    try {
      const deletedFile = await this.repository.delete(id);
      await this.deleteFileFromAzure(file.filename);
      return mapDBMediaToMediaDto(deletedFile, this.uploadPath)
    } catch (err) {
        throw new Error("Unable to delete file");
    }
  }

  getMulterConfig = () => {
    return {
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 100000000,
      },
    };
  };
}

const storage: StorageEngine = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

export { AzureUploadService };
