import multer from "multer";
import { IUploadService } from "@/interfaces/uploadservice.interface";

let _service: IUploadService | undefined;

function getService(): IUploadService {
  if (!_service) {
    if (process.env.USE_AZURE_STORAGE === "true") {
      const { AzureUploadService } = require("@/services/azure-upload.service");
      _service = new AzureUploadService() as IUploadService;
    } else {
      const { LocalUploadService } = require("@/services/local-upload.service");
      _service = new LocalUploadService() as IUploadService;
    }
  }
  return _service!;
}

export function getUpload() {
  return multer(getService().getMulterConfig());
}

export { getService };
