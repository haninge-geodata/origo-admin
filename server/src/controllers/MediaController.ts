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

  async getAllFiles(req: Request, res: Response) {
    try {
      const items = await this.service.getAllFiles();
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getFileByIdOrFilename(req: Request, res: Response) {
    try {
      const item = await this.service.getFileByIdOrFilename(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async upload(req: Request, res: Response) {
    const multerReq = req as MulterRequest;
    if (multerReq?.files?.length > 0) {
      let createdFiles = [] as MediaDto[];
      try {
        for (const file of multerReq.files) {
          let createdFile = await this.service.saveFiles([file]);
          createdFiles.push(createdFile[0]);
        }
        res.status(200).json(createdFiles);
      } catch (error) {
        res.status(400).json({
          message: "No files were uploaded",
        });
      }
    } else {
      res.status(400).json({
        message: "No files were uploaded",
      });
    }
  }

  async renameFile(req: Request, res: Response) {
    const currentFilename = req.params.currentName;
    const newFilename = req.params.newName;
    console.log(`[${new Date().toISOString()}] Renaming file '${currentFilename}' to '${newFilename}'`);
    try {
      const fileRegistration = await this.service.renameFile(currentFilename, newFilename);
      res.status(200).json(fileRegistration);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let file = await this.service.deleteFile(id);
      console.log(`[${new Date().toISOString()}] Media file and registration with id '${id}' deleted successfully`);
      res.status(200).json(file);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAllFolders(req: Request, res: Response) {
    try {
      const items = await this.service.getAllFolders();
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getFolderByIdOrFolderName(req: Request, res: Response) {
    try {
      const item = await this.service.getFolderByIdOrFolderName(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createFolder(req: Request, res: Response) {
    const folderName = req.params.name;
    console.log(`[${new Date().toISOString()}] Creating folder: ${folderName}`);
    try {
      const folderRegistration = await this.service.createFolder(folderName);
      res.status(201).json(folderRegistration);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async renameFolder(req: Request, res: Response) {
    const currentFolderName = req.params.currentName;
    const newFolderName = req.params.newName;
    console.log(`[${new Date().toISOString()}] Renaming folder '${currentFolderName}' to '${newFolderName}'`);
    try {
      const folderRegistration = await this.service.renameFolder(currentFolderName, newFolderName);
      res.status(200).json(folderRegistration);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteFolderById(req: Request, res: Response) {
    const folderId = req.params.id;
    try {
      const folderRegistration = await this.service.deleteFolder(folderId);
      console.log(`[${new Date().toISOString()}] Folder with id '${folderId}' deleted successfully`);
      res.status(200).json(folderRegistration);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: any) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unexpected error" });
    }
  }
}

const mediaController = new MediaController();
export { mediaController as MediaController };
