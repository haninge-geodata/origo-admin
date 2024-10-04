import { styleSchemaController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "styles";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/:id
 * @description Get a specific style schema by ID
 * @param {string} id - The style schema ID
 * @returns {StyleSchemaDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.getById(req, res));

/**
 * @route GET /${route}/name/{name}
 * @description Get style schema(s) by name
 * @param {string} name - The style schema name
 * @returns {StyleSchemaDto[]}
 */
router.get(`/${route}/name/:name`, (req, res) =>
  controller.getByName(req, res)
);

/**
 * @route GET /${route}
 * @description Get all style schemas
 * @returns {StyleSchemaDto[]}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}
 * @description Create a new style schema
 * @request {StyleSchemaDto} requestBody - The style schema data to create
 * @returns {StyleSchemaDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/:id
 * @description Update a specific style schema
 * @param {string} id - The style schema ID
 * @request {StyleSchemaDto} requestBody - The updated style schema data
 * @returns {StyleSchemaDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @description Delete a specific style schema
 * @param {string} id - The style schema ID
 * @returns {StyleSchemaDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
