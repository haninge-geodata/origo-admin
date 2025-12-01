import { getUpload } from "@/services/upload-factory";
import { MediaController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "media";
const upload = getUpload();
const router = createSecureRouter(route);

/**
 * @route GET /${route}/upload/
 * @description Get all media file registrations
 * @returns {MediaDto[]}
 */
router.get(`/${route}/upload`, (req, res) => controller.getAllFiles(req, res));

/**
 * @route GET /${route}/upload/:id
 * @description Get a specific media file registration by id or filename
 * @param {string} id - The media file ID or filename
 * @returns {MediaDto}
 */
router.get(`/${route}/upload/:id`, (req, res) => controller.getFileByIdOrFilename(req, res));

/**
 * @route POST /${route}/upload/
 * @description Upload media file(s)
 * @request {request} requestBody - The media file(s) to upload
 * @returns {MediaDto[]}
 */
router.post(`/${route}/upload/`, upload.any(), (req, res) => {
  controller.upload(req, res);
});

/**
 * @route PUT /${route}/upload/:currentName/:newName
 * @description Rename a media file
 * @param {string} currentName - The media file's current name
 * @param {string} newName - What to rename the media file to
 * @returns {MediaDto}
 */
router.put(`/${route}/upload/:currentName/:newName`, (req, res) => controller.renameFile(req, res));

/**
 * @route DELETE /${route}/upload/:id
 * @description Delete a specific media file and its registration
 * @param {string} id - The media file ID
 * @returns {MediaDto}
 */
router.delete(`/${route}/upload/:id`, (req, res) => controller.deleteById(req, res));

/**
 * @route GET /${route}/folder/
 * @description Get all media folder registrations
 * @returns {MediaDto[]}
 */
router.get(`/${route}/folder`, (req, res) => controller.getAllFolders(req, res));

/**
 * @route GET /${route}/folder/:id
 * @description Get a specific media folder registration by id or folder name
 * @param {string} id - The media folder ID or folder name
 * @returns {MediaDto}
 */
router.get(`/${route}/folder/:id`, (req, res) => controller.getFolderByIdOrFolderName(req, res));

/**
 * @route POST /${route}/folder/:name
 * @description Create a new media folder
 * @param {string} name - The media folder name. The POST body will be ignored
 * @returns {MediaDto}
 */
router.post(`/${route}/folder/:name`, (req, res) => controller.createFolder(req, res));

/**
 * @route PUT /${route}/folder/:currentName/:newName
 * @description Rename a media folder
 * @param {string} currentName - The media folder's current name
 * @param {string} newName - What to rename the media folder to
 * @returns {MediaDto}
 */
router.put(`/${route}/folder/:currentName/:newName`, (req, res) => controller.renameFolder(req, res));

/**
 * @route DELETE /${route}/folder/:id
 * @description Delete a media folder (must be empty)
 * @param {string} id - The media folder id
 * @returns {MediaDto}
 */
router.delete(`/${route}/folder/:id`, (req, res) => controller.deleteFolderById(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
