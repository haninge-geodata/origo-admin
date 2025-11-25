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
router.get(`/${route}/upload`, (req, res) => controller.getAll(req, res));

/**
 * @route GET /${route}/upload/:id
 * @description Get a specific media file registration by id or filename
 * @param {string} id - The media file ID
 * @returns {MediaDto}
 */
router.get(`/${route}/upload/:id`, (req, res) => controller.getByIdOrFilename(req, res));

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
 * @route DELETE /${route}/upload/:id
 * @description Delete a specific media file and its registration
 * @param {string} id - The media file ID
 * @returns {MediaDto}
 */
router.delete(`/${route}/upload/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
