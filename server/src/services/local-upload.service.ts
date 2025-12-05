import multer, { StorageEngine } from "multer";
import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";
import { Request } from "express";
import { mapMulterFileToDBMedia, mapFolderToDBMedia, mapDBMediaToMediaDto } from "@/mappers/";
import { Repository } from "@/repositories/Repository";
import { DBMedia, MediaModel } from "@/models";
import { MediaDto } from "@/shared/interfaces/dtos";
import { IUploadService } from "@/interfaces/uploadservice.interface";

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER!;
class LocalUploadService implements IUploadService {
  private uploadUrl = "";
  private repository: Repository<DBMedia>;

  constructor() {
    this.repository = new Repository<DBMedia>(MediaModel);
    this.uploadUrl = process.env.UPLOAD_URL!;
  }

  async getAllFiles(): Promise<MediaDto[]> {
    try {
      const files = await this.repository.findByCriteria({ fieldname: 'files' });
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
        // id is a valid ObjectId
        file = (await this.repository.query({ _id: id, fieldname: "files"  }, null, 1))[0];
      } else {
        file = (await this.repository.findByCriteria({ filename: new RegExp(`^${id}$`, "i"), fieldname: "files"  }))[0];
      }
      return mapDBMediaToMediaDto(file, this.uploadUrl);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get the media file registration");
    }
  }

  async saveFiles(files: Express.Multer.File[], path: string): Promise<MediaDto[]> {
    const filesToSave = files.map((file) => mapMulterFileToDBMedia(file, path));
    let created = [];
    for (const fileToSave of filesToSave) {
      try {
        const createdObject = await this.repository.upsert({ filename: new RegExp(`^${fileToSave.filename}$`, "i") }, fileToSave);
        created.push(createdObject);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ${error}`);
      }
    }
    return created.map((item) => mapDBMediaToMediaDto(item, this.uploadUrl));
  }

  async renameFile(currentFilename: string, newFilename: string, move: boolean = true): Promise<MediaDto> {
    try {
      const file = (await this.repository.findByCriteria({ filename: currentFilename }))[0];
      const currentFilePath = path.resolve(UPLOAD_FOLDER, file.filename);
      const newFilePath = path.resolve(UPLOAD_FOLDER, newFilename);
      file.name = newFilename.substring(newFilename.lastIndexOf('/') + 1);
      file.filename = newFilename;
      const renamedFile = await this.repository.update(file._id.toString(), file);
      move && await fsPromises.rename(currentFilePath, newFilePath);
      console.warn(`[${new Date().toISOString()}] File '${currentFilePath}' renamed to '${newFilePath}'`);
      return mapDBMediaToMediaDto(renamedFile, this.uploadUrl);
    } catch (err) {
        throw new Error("Unable to rename file");
    }
  }

  async deleteFile(id: string): Promise<MediaDto> {
    const file = (await this.repository.query({ _id: id, fieldname: "files" }, null, 1))[0];
    const filename = file.filename;
    const filePath = path.resolve(UPLOAD_FOLDER, filename);
    try {
      await this.repository.delete(id);
      await fsPromises.unlink(filePath);
      console.warn(`[${new Date().toISOString()}] File deleted: ${filePath}`);
      return mapDBMediaToMediaDto(file, this.uploadUrl);
    } catch (err) {
        throw new Error("Unable to delete file");
    }
  }

  async getAllFolders(): Promise<MediaDto[]> {
    try {
      const files = await this.repository.findByCriteria({ fieldname: 'folders' });
      return files.map((file) => mapDBMediaToMediaDto(file, this.uploadUrl));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get media folder registrations");
    }
  }

  async getFolderByIdOrFolderName(id: string): Promise<MediaDto> {
    try {
      let folder;
      if (id.match(/^[0-9a-f]{24}$/i)) {
        // id is a valid ObjectId
        folder = (await this.repository.findByCriteria({ _id: id, fieldname: "folders" }))[0];
      } else {
        folder = (await this.repository.findByCriteria({ filename: new RegExp(`^${id}$`, "i"), fieldname: "folders" }))[0];
      }
      return mapDBMediaToMediaDto(folder, this.uploadUrl);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get the media folder registration");
    }
  }

  async getByFolder(id: string): Promise<MediaDto[]> {
    try {
      let folder: DBMedia;
      if (id.match(/^[0-9a-f]{24}$/i)) {
        // id is a valid ObjectId
        folder = (await this.repository.findByCriteria({ _id: id, fieldname: "folders" }))[0];
      } else if (!id) {
        folder = { filename: '' } as DBMedia;
      } else {
        folder = (await this.repository.findByCriteria({ filename: new RegExp(`^${id}$`, "i"), fieldname: "folders" }))[0];
      }
      const folderRegex = new RegExp(`^${folder.filename ? folder.filename + "/" : ""}[^/]+$`, "i");
      const files = await this.repository.findByCriteria({ filename: folderRegex });
      return files.map((file) => mapDBMediaToMediaDto(file, this.uploadUrl));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Unable to get the media folder registration");
    }
  }

  async createFolder(folderName: string): Promise<MediaDto> {
    const folderPath = path.resolve(UPLOAD_FOLDER, folderName);

    if (!fs.existsSync(folderPath)) {
      try {
        await fsPromises.mkdir(folderPath, { recursive: false });
        console.warn(`[${new Date().toISOString()}] Folder created at path: ${folderPath}`);
        const createdFolder = await this.repository.create(mapFolderToDBMedia(folderName));
        return mapDBMediaToMediaDto(createdFolder, this.uploadUrl);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ${error}`);
        throw new Error("Unable to create folder registration");
      }
    } else {
      throw new Error("Folder already exists");
    }
  }

  async renameFolder(currentFolderName: string, newFolderName: string): Promise<MediaDto> {
    try {
      const folder = (await this.repository.findByCriteria({ filename: new RegExp(`^${currentFolderName}$`, "i") }))[0];
      const currentFolderPath = path.resolve(UPLOAD_FOLDER, folder.filename);
      const newFolderPath = path.resolve(UPLOAD_FOLDER, newFolderName);
      folder.name = newFolderName.substring(newFolderName.lastIndexOf('/') + 1);
      folder.filename = newFolderName;
      const renamedFolder = await this.repository.update(folder._id.toString(), folder);
      await fsPromises.rename(currentFolderPath, newFolderPath);
      console.warn(`[${new Date().toISOString()}] Folder '${currentFolderPath}' renamed to '${newFolderPath}'`);
      return mapDBMediaToMediaDto(renamedFolder, this.uploadUrl);
    } catch (err) {
        throw new Error("Unable to rename folder");
    }
  }

  async deleteFolder(id: string): Promise<MediaDto> {
    try {
      const folder = (await this.repository.query({ _id: id, fieldname: "folders" }, null, 1))[0];
      const folderPath = path.resolve(UPLOAD_FOLDER, folder.filename);
      await this.repository.delete(folder._id.toString());
      await fsPromises.rmdir(folderPath);
      console.warn(`[${new Date().toISOString()}] Folder deleted: ${folderPath}`);
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
        fileSize: 100000000,
      },
    };
  };
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    const localUploadRoot = path.resolve(UPLOAD_FOLDER);
    const localUploadPath = path.resolve(`${UPLOAD_FOLDER}${req.params.path ? '/' + req.params.path : ''}`);

    if (!fs.existsSync(localUploadRoot)) {
      fs.mkdirSync(localUploadRoot, { recursive: true });
    }
    if (!fs.existsSync(localUploadPath)) {
      throw new Error(`Upload path does not exist: ${localUploadPath}`);
    }

    callback(null, localUploadPath);
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

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

export { LocalUploadService };
