import { FavoritesDto } from "@/shared/interfaces/dtos";
import { favoritesController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "favorites";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/list/{user}
 * @param {string} user - The user ID
 * @returns {FavoritesDto[]}
 */
router.get(`/${route}/list/:user`, (req, res) =>
  controller.getByUser(req, res)
);

/**
 * @route GET /${route}/{id}
 * @param {string} id - The share map ID
 * @returns {FavoritesDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.get(req, res));

/**
 * @route POST /${route}/
 * @request {FavoritesDto} requestBody - The share map data to create
 * @returns {FavoritesDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/{id}
 * @param {string} id - The share map ID
 * @request {FavoritesDto} requestBody - The updated share map data
 * @returns {FavoritesDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/{id}
 * @param {string} id - The share map ID
 * @returns {FavoritesDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.delete(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
