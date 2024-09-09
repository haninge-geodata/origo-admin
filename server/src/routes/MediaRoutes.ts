import { getUpload } from "@/services/upload-factory";
import { MediaController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "media/upload";
const upload = getUpload();
const router = createSecureRouter(route);

/**
 * @route GET /${route}/
 * @description Get all media files
 * @returns {MediaDto[]}
 */
router.get(`/${route}/`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}/
 * @description Upload media file(s)
 * @request {request} requestBody - The media file(s) to upload
 * @returns {MediaDto[]}
 */
router.post(`/${route}/`, upload.any(), (req, res) => {
  controller.upload(req, res);
});

/**
 * @route DELETE /${route}/:id
 * @description Delete a specific media file
 * @param {string} id - The media file ID
 * @returns {MediaDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.delete(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
