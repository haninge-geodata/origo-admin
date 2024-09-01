// adminRoutes.ts
import { routesController as controller } from "../controllers";
import { createSecureRouter } from "@/utils/routeUtils";

const route = "routes";
const router = createSecureRouter(route);

/**
 * @route GET /${route}
 * @description Get all available routes
 * @returns {GroupedRoutes[]}
 */
router.get(`/${route}`, (req, res) => controller.getAvailableRoutes(req, res));

export default router;
