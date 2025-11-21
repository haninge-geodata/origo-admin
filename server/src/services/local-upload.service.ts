import multer, { StorageEngine } from "multer";
import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";
import { Request } from "express";
import { mapMulterFileToDBMedia, mapDBMediaToMediaDto } from "@/mappers/";
import { Repository } from "@/repositories/Repository";
import { DBMedia, MediaModel } from "@/models";
import { MediaDto } from "@/shared/interfaces/dtos";
import { IUploadService } from "@/interfaces/uploadservice.interface";

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER!;
const UPLOAD_MAX_FILESIZE = parseInt(process.env.UPLOAD_MAX_FILESIZE as string) || 100000000;
class LocalUploadService implements IUploadService {
  private uploadFolder = UPLOAD_FOLDER;
  private uploadUrl = "";
  private repository: Repository<DBMedia>;

  constructor() {
    this.repository = new Repository<DBMedia>(MediaModel);
    this.uploadUrl = process.env.UPLOAD_URL!;
  }

  async getAllFiles(): Promise<MediaDto[]> {
    try {
      const files = await this.repository.findAll();
      return files.map((file) => mapDBMediaToMediaDto(file, this.uploadUrl));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      throw new Error("Det gick inte att hämta filerna");
    }
  }

  async saveFiles(files: Express.Multer.File[]): Promise<MediaDto[]> {
    const filesToSave = files.map((file) => mapMulterFileToDBMedia(file));
    let created = [];
    for (const fileToSave of filesToSave) {
      try {
        const createdObject = await this.repository.create(fileToSave);
        created.push(createdObject);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ${error}`);
      }
    }
    return created.map((item) => mapDBMediaToMediaDto(item, this.uploadUrl));
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.repository.find(id);
    const filename = file.filename;
    const filePath = path.resolve(UPLOAD_FOLDER, filename);
    await fsPromises.unlink(filePath);
    await this.repository.delete(id);
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

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    const localUploadPath = path.resolve(UPLOAD_FOLDER);

    if (!fs.existsSync(localUploadPath)) {
      fs.mkdirSync(localUploadPath, { recursive: true });
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
) => callback(null, true);
/** The filter function can be used to restrict which files are allowed.
  {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};
 */

export { LocalUploadService };
