import { RelationController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "relations";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/:id/:in/:path
 * @description Get related entities for a specific ID, input, and path
 * @param {string} id - The ID of the entity
 * @param {string} in - The input type or context, e.g. MapInstance
 * @param {string} path - The relation path, e.g. instance.layers.id
 * @returns {RelationDto[]}
 */
router.get(`/${route}/:id/:in/:path`, (req, res) => controller.getRelated(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
