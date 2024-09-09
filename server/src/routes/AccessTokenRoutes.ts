import { accessTokenController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "access-token";
const router = createSecureRouter(route);

/**
 * @route GET /${route}
 * @description Get all access tokens
 * @returns {AccessTokenListItemDto[]}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}
 * @description Create a new access token
 * @request {CreateAccessTokenDto} requestBody - The access token data to create
 * @returns {AccessTokenResponseDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route DELETE /${route}/:id
 * @description Delete an access token
 * @param {string} id - The access token ID
 * @returns
 */
router.delete(`/${route}/:id`, (req, res) => controller.delete(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
