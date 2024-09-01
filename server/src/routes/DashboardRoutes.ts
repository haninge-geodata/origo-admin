import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";
import { dashboardController as controller } from "../controllers";

const route = "dashboard";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/
 * @returns {DashboardDto}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
