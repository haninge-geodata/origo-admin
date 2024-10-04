import { proxyController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "proxy";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/resources
 * @description Get all proxy resources
 * @returns {ProxyResourceDto[]}
 */
router.get(`/${route}/resources`, (req, res) =>
  controller.getAllResources(req, res)
);

/**
 * @route GET /${route}/roles
 * @description Get all proxy roles
 * @returns {ProxyRoleDto[]}
 */
router.get(`/${route}/roles`, (req, res) => controller.getAllRoles(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
