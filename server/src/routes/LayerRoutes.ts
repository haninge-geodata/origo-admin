import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";
import { layerController as controller } from "../controllers";

const route = "layers";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/name/{name}
 * @description Get specific layers by name
 * @param {string} name - The layer name
 * @returns {BaseLayerDto[]}
 */
router.get(`/${route}/name/:name`, (req, res) => controller.getByName(req, res));

/**
 * @route GET /${route}/:type/:id
 * @description Get a specific layer by type and ID
 * @param {string} type - The layer type (wfs, wms, wmts or all)
 * @param {string} id - The layer ID
 * @returns {BaseLayerDto}
 */
router.get(`/${route}/:type/:id`, (req, res) => controller.get(req, res));

/**
 * @route GET /${route}/:type
 * @description Get all layers of a specific type
 * @param {string} type - The layer type (wfs, wms, wmts, or all)
 * @returns {BaseLayerDto[]}
 */
router.get(`/${route}/:type`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}/:type
 * @description Create a new layer of a specific type
 * @param {string} type - The layer type (wfs, wms, or wmts)
 * @request {BaseLayerDto[]} requestBody - Array of layer data to create
 * @returns {BaseLayerDto[]}
 */
router.post(`/${route}/:type`, (req, res) => controller.create(req, res));

/**
 * @route POST /${route}/:type/duplicate/:id
 * @description Duplicate a layer of a specific type
 * @param {string} type - The layer type (wfs, wms, or wmts)
 * @param {string} id - The ID of the layer to duplicate
 * @returns {BaseLayerDto}
 */
router.post(`/${route}/:type/duplicate/:id`, (req, res) =>
  controller.duplicate(req, res)
);

/**
 * @route PUT /${route}/:type/:id
 * @description Update a layer of a specific type
 * @param {string} type - The layer type (wfs, wms, or wmts)
 * @param {string} id - The layer ID
 * @request {BaseLayerDto} requestBody - The updated layer data
 * @returns {BaseLayerDto}
 */
router.put(`/${route}/:type/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:type/:id
 * @description Delete a layer of a specific type
 * @param {string} type - The layer type (wfs, wms, or wmts)
 * @param {string} id
 * @returns {BaseLayerDto}
 */
router.delete(`/${route}/:type/:id`, (req, res) => controller.delete(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
