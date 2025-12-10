import { DBMedia } from "@/models";
import { MediaDto } from "@/shared/interfaces/dtos";
import mongoose from "mongoose";

function mapDBMediaToMediaDto(dbMedia: DBMedia, upload_url: string): MediaDto {
  const fullPath = new URL(dbMedia.filename, upload_url).toString();
  return {
    id: dbMedia._id.toHexString(),
    name: dbMedia.name,
    filename: dbMedia.filename,
    mimetype: dbMedia.mimetype,
    fieldname: dbMedia.fieldname,
    size: dbMedia.size,
    path: fullPath,
  };
}

function mapMulterFileToDBMedia(file: Express.Multer.File, path?: string): DBMedia {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: file.originalname,
    filename: `${path ? path + "/" : ""}${file.filename}`,
    mimetype: file.mimetype,
    fieldname: "files",
    size: file.size,
  };
}

function mapFolderToDBMedia(folderName: string): DBMedia {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: folderName.substring(folderName.lastIndexOf('/') + 1),
    filename: folderName,
    mimetype: "folder",
    fieldname: "folders",
    size: 0,
  };
}

export { mapDBMediaToMediaDto, mapMulterFileToDBMedia, mapFolderToDBMedia };
