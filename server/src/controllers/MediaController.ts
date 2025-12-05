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

  async isPathValid(path: string, type: string, res: Response): Promise<boolean> {
    const trimmedPath = path.replace(/^\/|\/$/g, '' );
    if (trimmedPath.toLocaleLowerCase() === "root") {
      console.error(`[${new Date().toISOString()}] Client tried to create a ${type} with the reserved name 'root'. Aborting...`);
      res.status(400).json({ error: "'root' is reserved and cannot be used." });
      return false;
    }
    if (trimmedPath.includes('/')) {
      try {
        await this.service.getFolderByIdOrFolderName(trimmedPath.substring(0, trimmedPath.lastIndexOf('/')));
      } catch (error) {
        let errormsg = `Could not get parent folder: ${trimmedPath.substring(0, trimmedPath.lastIndexOf('/'))}`;
        console.error(`[${new Date().toISOString()}] ${errormsg}`);
        res.status(400).json({ error: errormsg });
        return false;
      }
    }
    return true;
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
      const item = await this.service.getFileByIdOrFilename(req.params.id.replace(/^\/|\/$/g, '' ));
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
          let createdFile = await this.service.saveFiles([file], req.params.path?.replace(/^\/|\/$/g, '' ));
          createdFiles.push(createdFile[0]);
        }
        res.status(201).json(createdFiles);
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
    const currentFilename = req.params.currentName.replace(/^\/|\/$/g, '' );
    const newFilename = req.params.newName.replace(/^\/|\/$/g, '' );
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
    console.log(`[${new Date().toISOString()}] Deleting media file and registration with id '${id}'`);
    try {
      let file = await this.service.deleteFile(id);
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
      const item = await this.service.getFolderByIdOrFolderName(req.params.id.replace(/^\/|\/$/g, '' ));
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getByFolder(req: Request, res: Response) {
    const trimmedId = req.params.id.replace(/^\/|\/$/g, '' );
    let folder;
    try {
      if (trimmedId.toLowerCase() !== 'root') {
        folder = await this.service.getFolderByIdOrFolderName(trimmedId);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Folder not found: '${trimmedId}'`);
      return res.status(404).json({ error: `Folder not found: '${trimmedId}'` });
    }
    try {
      const items = await this.service.getByFolder(trimmedId.toLowerCase() === 'root' ? '' : folder!.filename);
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createFolder(req: Request, res: Response) {
    const folderName = req.params.name.replace(/^\/|\/$/g, '' );
    if (await this.isPathValid(folderName, 'folder', res)) {
      console.log(`[${new Date().toISOString()}] Creating folder: ${folderName}`);
      try {
        const folderRegistration = await this.service.createFolder(folderName);
        res.status(201).json(folderRegistration);
      } catch (error) {
        this.handleError(res, error);
      }
    }
  }

  async renameFolder(req: Request, res: Response) {
    const currentFolderName = req.params.currentName.replace(/^\/|\/$/g, '' );
    const newFolderName = req.params.newName.replace(/^\/|\/$/g, '' );
    if (await this.isPathValid(newFolderName, 'folder', res)) {
      console.log(`[${new Date().toISOString()}] Renaming folder '${currentFolderName}' to '${newFolderName}'`);
      try {
        const items = await this.service.getByFolder(currentFolderName);
        for (const item of items) {
          if (item.filename.startsWith(currentFolderName + '/')) {
            const newItemName = newFolderName + item.filename.substring(currentFolderName.length);
            console.log(`[${new Date().toISOString()}] Renaming item '${item.filename}' to '${newItemName}'`);
            await this.service.renameFile(item.filename, newItemName, false);
          }
        }
        const folderRegistration = await this.service.renameFolder(currentFolderName, newFolderName);
        res.status(200).json(folderRegistration);
      } catch (error) {
        this.handleError(res, error);
      }
    }
  }

  async deleteFolderById(req: Request, res: Response) {
    const folderId = req.params.id;
    try {
      const contents = await this.service.getByFolder(folderId);
      if (contents?.length === 0) {
        console.log(`[${new Date().toISOString()}] Deleting folder with id '${folderId}'`);
        const folderRegistration = await this.service.deleteFolder(folderId);
        res.status(200).json(folderRegistration);
      } else {
        this.handleError(res, new Error("Folder not empty"));
      }
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
