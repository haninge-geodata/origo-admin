import multer, { StorageEngine } from "multer";
import { Request } from "express";
import * as dotenv from "dotenv";
import {
  mapMulterFileToDBMedia,
  mapFolderToDBMedia,
  mapDBMediaToMediaDto,
} from "@/mappers/";
import { Repository } from "@/repositories/Repository";
import { DBMedia, MediaModel } from "@/models";
import { MediaDto } from "@/shared/interfaces/dtos";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { IUploadService } from "@/interfaces/uploadservice.interface";

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME!;
const UPLOAD_MAX_FILESIZE =
  parseInt(process.env.UPLOAD_MAX_FILESIZE as string) || 100000000;

class AzureUploadService implements IUploadService {
  private uploadUrl: string;
  private repository: Repository<DBMedia>;
  private containerClient: ContainerClient;

  constructor() {
    this.repository = new Repository<DBMedia>(MediaModel);
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    this.containerClient =
      blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
    this.uploadUrl = `${blobServiceClient.url.replace(/\/$/, '')}/${AZURE_CONTAINER_NAME}/`;
  }

  async getAllFiles(): Promise<MediaDto[]> {
    try {
      const files = await this.repository.findByCriteria({
        fieldname: "files",
      });
      return files.map((file) => mapDBMediaToMediaDto(file, this.uploadUrl));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get media file registrations");
    }
  }

  async getFileByIdOrFilename(id: string): Promise<MediaDto> {
    try {
      let file;
      if (id.match(/^[0-9a-f]{24}$/i)) {
        file = (
          await this.repository.query(
            { _id: id, fieldname: "files" },
            null,
            1
          )
        )[0];
      } else {
        file = (
          await this.repository.findByCriteria({
            filename: new RegExp(`^${id}$`, "i"),
            fieldname: "files",
          })
        )[0];
      }
      return mapDBMediaToMediaDto(file, this.uploadUrl);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get the media file registration");
    }
  }

  private async uploadToAzure(
    file: Express.Multer.File,
    folder?: string
  ): Promise<string> {
    const blobName = `${folder ? folder + "/" : ""}${Date.now()}-${file.originalname}`;
    const blockBlobClient =
      this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return blobName;
  }

  private async deleteFileFromAzure(blobName: string): Promise<void> {
    const blobClient = this.containerClient.getBlobClient(blobName);
    await blobClient.deleteIfExists();
  }

  /**
   * Copy a blob to a new name within the same container, then delete the original.
   * Same-account copies are handled server-side by Azure Storage.
   */
  private async copyAndDeleteBlob(
    sourceName: string,
    destName: string
  ): Promise<void> {
    const sourceBlob = this.containerClient.getBlobClient(sourceName);
    const destBlob = this.containerClient.getBlobClient(destName);
    const poller = await destBlob.beginCopyFromURL(sourceBlob.url);
    await poller.pollUntilDone();
    await sourceBlob.delete();
  }

  async saveFiles(
    files: Express.Multer.File[],
    folder?: string
  ): Promise<MediaDto[]> {
    const promises = files.map(async (file) => {
      const blobName = await this.uploadToAzure(file, folder);
      const dbMedia = mapMulterFileToDBMedia(file, folder);
      dbMedia.filename = blobName;
      return await this.repository.create(dbMedia);
    });

    const createdFiles = await Promise.all(promises);
    return createdFiles.map((file) =>
      mapDBMediaToMediaDto(file, this.uploadUrl)
    );
  }

  async renameFile(
    currentFilename: string,
    newFilename: string,
    move: boolean = true
  ): Promise<MediaDto> {
    try {
      const file = (
        await this.repository.findByCriteria({ filename: currentFilename })
      )[0];
      file.name = newFilename.substring(newFilename.lastIndexOf("/") + 1);
      file.filename = newFilename;
      const renamedFile = await this.repository.update(
        file._id.toString(),
        file
      );
      if (move) {
        await this.copyAndDeleteBlob(currentFilename, newFilename);
      }
      console.warn(
        `[${new Date().toISOString()}] Blob '${currentFilename}' renamed to '${newFilename}'`
      );
      return mapDBMediaToMediaDto(renamedFile, this.uploadUrl);
    } catch (err) {
      throw new Error("Unable to rename file");
    }
  }

  async deleteFile(id: string): Promise<MediaDto> {
    const file = (
      await this.repository.query({ _id: id, fieldname: "files" }, null, 1)
    )[0];
    try {
      const deletedFile = await this.repository.delete(id);
      await this.deleteFileFromAzure(file.filename);
      return mapDBMediaToMediaDto(deletedFile, this.uploadUrl);
    } catch (err) {
      throw new Error("Unable to delete file");
    }
  }

  async getAllFolders(): Promise<MediaDto[]> {
    try {
      const folders = await this.repository.findByCriteria({
        fieldname: "folders",
      });
      return folders.map((folder) =>
        mapDBMediaToMediaDto(folder, this.uploadUrl)
      );
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get media folder registrations");
    }
  }

  async getFolderByIdOrFolderName(id: string): Promise<MediaDto> {
    try {
      let folder;
      if (id.match(/^[0-9a-f]{24}$/i)) {
        folder = (
          await this.repository.findByCriteria({
            _id: id,
            fieldname: "folders",
          })
        )[0];
      } else {
        folder = (
          await this.repository.findByCriteria({
            filename: new RegExp(`^${id}$`, "i"),
            fieldname: "folders",
          })
        )[0];
      }
      if (!folder) {
        throw new Error("Folder not found");
      }
      return mapDBMediaToMediaDto(folder, this.uploadUrl);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get the media folder registration");
    }
  }

  async getByFolder(id: string): Promise<MediaDto[]> {
    try {
      let folderName: string;
      if (id.match(/^[0-9a-f]{24}$/i)) {
        folderName = (
          await this.repository.findByCriteria({
            _id: id,
            fieldname: "folders",
          })
        )[0].filename;
      } else if (!id) {
        folderName = "";
      } else {
        folderName = id;
      }
      const folderRegex = new RegExp(
        `^${folderName ? `${folderName}/` : ""}[^/]+$`,
        "i"
      );
      const files = await this.repository.findByCriteria({
        filename: folderRegex,
      });
      return files.map((file) => mapDBMediaToMediaDto(file, this.uploadUrl));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get the media folder registration");
    }
  }

  async createFolder(folderName: string): Promise<MediaDto> {
    try {
      const createdFolder = await this.repository.create(
        mapFolderToDBMedia(folderName)
      );
      return mapDBMediaToMediaDto(createdFolder, this.uploadUrl);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to create folder registration");
    }
  }

  async renameFolder(
    currentFolderName: string,
    newFolderName: string,
    move: boolean = true
  ): Promise<MediaDto> {
    try {
      const folder = (
        await this.repository.findByCriteria({
          filename: new RegExp(`^${currentFolderName}$`, "i"),
        })
      )[0];
      folder.name = newFolderName.substring(
        newFolderName.lastIndexOf("/") + 1
      );
      folder.filename = newFolderName;
      const renamedFolder = await this.repository.update(
        folder._id.toString(),
        folder
      );

      if (move) {
        const prefix = `${currentFolderName}/`;
        for await (const blob of this.containerClient.listBlobsFlat({
          prefix,
        })) {
          const newBlobName =
            newFolderName + blob.name.substring(currentFolderName.length);
          await this.copyAndDeleteBlob(blob.name, newBlobName);
        }
      }

      console.warn(
        `[${new Date().toISOString()}] Folder '${currentFolderName}' renamed to '${newFolderName}'`
      );
      return mapDBMediaToMediaDto(renamedFolder, this.uploadUrl);
    } catch (err) {
      throw new Error("Unable to rename folder");
    }
  }

  async deleteFolder(id: string): Promise<MediaDto> {
    try {
      const folder = (
        await this.repository.query(
          { _id: id, fieldname: "folders" },
          null,
          1
        )
      )[0];
      await this.repository.delete(folder._id.toString());
      console.warn(
        `[${new Date().toISOString()}] Folder deleted: ${folder.filename}`
      );
      return mapDBMediaToMediaDto(folder, this.uploadUrl);
    } catch (err) {
      throw new Error("Unable to delete folder");
    }
  }

  getMulterConfig = () => {
    return {
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: UPLOAD_MAX_FILESIZE,
      },
    };
  };
}

const storage: StorageEngine = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => callback(null, true);

export { AzureUploadService };
