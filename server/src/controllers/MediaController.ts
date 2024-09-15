import { Request, Response } from "express";
import { AzureUploadService, LocalUploadService } from "@/services/";
import { MediaDto } from "@/shared/interfaces/dtos";
import { IUploadService } from "@/interfaces/uploadservice.interface";

interface MulterRequest extends Request {
  file: Express.Multer.File;
  files: Express.Multer.File[];
}

class MediaController {
  private service: IUploadService;

  constructor() {
    this.service =
      process.env.USE_AZURE_STORAGE === "true"
        ? new AzureUploadService()
        : new LocalUploadService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.service.getAllFiles();
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async upload(req: Request, res: Response) {
    const multerReq = req as MulterRequest;
    if (multerReq.files && Array.isArray(multerReq.files)) {
      let createdFiles = [] as MediaDto[];
      for (const file of multerReq.files) {
        let createdFile = await this.service.saveFiles([file]);
        createdFiles.push(createdFile[0]);
      }
      res.status(200).json(createdFiles);
    } else {
      res.status(400).json({
        message: "Inga filer uppladdade eller filtypen är inte tillåten",
      });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let file = await this.service.deleteFile(id);
      res
        .status(200)
        .json({ message: "Ikonen har tagits bort framgångsrikt", file: file });
    } catch (error) {
      this.handleError(res, error);
    }
  }
  private handleError(res: Response, error: any) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Ett oväntat fel inträffade" });
    }
  }
}

const mediaController = new MediaController();
export { mediaController as MediaController };
