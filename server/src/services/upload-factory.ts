import multer from "multer";
import { LocalUploadService } from "@/services/local-upload.service";
import { AzureUploadService } from "@/services/azure-upload.service";

const localUploadService = new LocalUploadService();
const azureUploadService = new AzureUploadService();

export function getUpload() {
  if (process.env.USE_AZURE_STORAGE === "true") {
    return multer(azureUploadService.getMulterConfig());
  } else {
    return multer(localUploadService.getMulterConfig());
  }
}
