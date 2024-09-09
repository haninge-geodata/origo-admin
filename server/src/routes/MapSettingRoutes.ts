import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";
import { mapSettingController as controller } from "../controllers";

const route = "mapsettings";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/:id
 * @description Get a specific map setting by ID
 * @param {string} id - The map setting ID
 * @returns {MapSettingDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.get(req, res));

/**
 * @route GET /${route}
 * @description Get all map settings
 * @returns {MapSettingDto[]}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}
 * @description Create a new map setting
 * @request {MapSettingDto} requestBody - The map setting data to create
 * @returns {MapSettingDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/:id
 * @description Update a specific map setting
 * @param {string} id - The map setting ID
 * @request {MapSettingDto} requestBody - The updated map setting data
 * @returns {MapSettingDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @description Delete a specific map setting
 * @param {string} id - The map setting ID
 * @returns {MapSettingDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.delete(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
