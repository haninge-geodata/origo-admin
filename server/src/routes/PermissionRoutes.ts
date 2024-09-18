import { permissionController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "permissions";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/roles/:id
 * @description Get a specific role permission by ID
 * @param {string} id - The role permission ID
 * @returns {RoleDto}
 */
router.get(`/${route}/roles/:id`, (req, res) => controller.getById(req, res));

/**
 * @route GET /${route}/roles/name/:name
 * @description Get a specific role permission by Name
 * @param {string} name - The role permission Name
 * @returns {RoleDto}
 */
router.get(`/${route}/roles/name/:name`, (req, res) =>
  controller.getByName(req, res)
);

/**
 * @route GET /${route}/roles
 * @description Get all role permissions
 * @returns {RoleDto[]}
 */
router.get(`/${route}/roles`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}/roles
 * @description Create a new role permission
 * @request {RoleDto} requestBody - The role permission data to create
 * @returns {RoleDto}
 */
router.post(`/${route}/roles`, (req, res) => controller.create(req, res));

/**
 * @route POST /${route}/roles/duplicate/:id
 * @description Duplicate a specific role permission
 * @param {string} id - The ID of the role permission to duplicate
 * @returns {RoleDto}
 */
router.post(`/${route}/roles/duplicate/:id`, (req, res) =>
  controller.duplicate(req, res)
);

/**
 * @route PUT /${route}/roles/:id
 * @description Update a specific role permission
 * @param {string} id - The role permission ID
 * @request {RoleDto} requestBody - The updated role permission data
 * @returns {RoleDto}
 */
router.put(`/${route}/roles/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/roles/:id
 * @description Delete a specific role permission
 * @param {string} id - The role permission ID
 * @returns {RoleDto}
 */
router.delete(`/${route}/roles/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
