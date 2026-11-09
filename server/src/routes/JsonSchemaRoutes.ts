import { jsonSchemaController as controller } from "../controllers/JsonSchemaController";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "jsonschemas";
const router = createSecureRouter(route);

/**
 * @route GET /${route}
 * @description Get all JSON schemas
 * @returns {JsonSchemaDto[]}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

/**
 * @route GET /${route}/visible
 * @description Get all visible JSON schemas
 * @returns {JsonSchemaDto[]}
 */
router.get(`/${route}/visible`, (req, res) => controller.getVisible(req, res));

/**
 * @route GET /${route}/menu-items
 * @description Get menu items for all visible JSON schemas
 * @returns {MenuItem[]}
 */
router.get(`/${route}/menu-items`, (req, res) =>
  controller.getMenuItems(req, res)
);

/**
 * @route GET /${route}/by-name/:name
 * @description Get JSON schema by name
 * @param {string} name - The JSON schema name
 * @returns {JsonSchemaDto}
 */
router.get(`/${route}/by-name/:name`, (req, res) =>
  controller.getByName(req, res)
);

/**
 * @route GET /${route}/:id
 * @description Get a specific JSON schema by ID
 * @param {string} id - The JSON schema ID
 * @returns {JsonSchemaDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.getById(req, res));

/**
 * @route POST /${route}
 * @description Create a new JSON schema
 * @request {JsonSchemaDto} requestBody - The JSON schema data to create
 * @returns {JsonSchemaDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/:id
 * @description Update a specific JSON schema
 * @param {string} id - The JSON schema ID
 * @request {JsonSchemaDto} requestBody - The updated JSON schema data
 * @returns {JsonSchemaDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @description Delete a specific JSON schema
 * @param {string} id - The JSON schema ID
 * @returns {JsonSchemaDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
