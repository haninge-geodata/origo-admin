import { shareMapController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "favourites";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/list/:user
 * @param {string} user - The user ID
 * @returns {ShareMapDto[]}
 */
router.get(`/${route}/list/:user`, (req, res) =>
  controller.getByUser(req, res)
);

/**
 * @route GET /${route}/:id
 * @param {string} id - The share map ID
 * @returns {ShareMapDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.get(req, res));

/**
 * @route POST /${route}/
 * @param {ShareMapDto} requestBody - The share map data to create
 * @returns {ShareMapDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/:id
 * @param {string} id - The share map ID
 * @param {ShareMapDto} requestBody - The updated share map data
 * @returns {ShareMapDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @param {string} id - The share map ID
 * @returns {ShareMapDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.delete(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
