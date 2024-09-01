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

function mapMulterFileToDBMedia(file: Express.Multer.File): DBMedia {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
    size: file.size,
  };
}

export { mapMulterFileToDBMedia, mapDBMediaToMediaDto };
