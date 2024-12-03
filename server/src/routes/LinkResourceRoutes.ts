import { linkResourceController as controller } from "../controllers/";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "link-resources";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/:id
 * @description Get a specific link resource by ID
 * @param {string} id - The link resource ID
 * @returns {LinkResourceDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.getById(req, res));

/**
 * @route GET /${route}/name/{name}
 * @description Get link resources by name
 * @param {string} name - The link resource name
 * @returns {LinkResourceDto[]}
 */
router.get(`/${route}/name/:name`, (req, res) => controller.getByName(req, res));

/**
 * @route GET /${route}/type/:type
 * @description Get link resources by type
 * @param {string} type - The link resource type
 * @returns {LinkResourceDto[]}
 */
router.get(`/${route}/type/:type`, (req, res) => controller.getByType(req, res));

/**
 * @route GET /${route}
 * @description Get all link resources
 * @returns {LinkResourceDto[]}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}
 * @description Create a new link resource
 * @request {LinkResourceDto} requestBody - The link resource data to create
 * @returns {LinkResourceDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/:id
 * @description Update a link resource
 * @param {string} id - The link resource ID
 * @request {LinkResourceDto} requestBody - The updated link resource data
 * @returns {LinkResourceDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @description Delete a link resource
 * @param {string} id - The link resource ID
 * @returns {LinkResourceDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
