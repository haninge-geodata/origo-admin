import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";
import { mapControlController as controller } from "../controllers";

const route = "mapcontrols";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/:id
 * @description Get a specific map control by ID
 * @param {string} id - The map control ID
 * @returns {MapControlDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.getById(req, res));

/**
 * @route GET /${route}
 * @description Get all map controls
 * @returns {MapControlDto[]}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}
 * @description Create a new map control
 * @request {MapControlDto} requestBody - The map control data to create
 * @returns {MapControlDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/:id
 * @description Update a map control
 * @param {string} id - The map control ID
 * @request {MapControlDto} requestBody - The updated map control data
 * @returns {MapControlDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @description Delete a map control
 * @param {string} id - The map control ID
 * @returns {MapControlDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
