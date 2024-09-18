import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";
import { mapInstanceController as controller } from "../controllers";

const route = "mapinstances";
const router = createSecureRouter(route);

/**
 * @route GET /${route}/:id/preview(\.json)?
 * @description Get a preview of a specific map instance
 * @param {string} id - The map instance ID
 * @returns {PublishedMapConfigDto}
 */
router.get(`/${route}/:id/preview(\.json)?`, (req, res) =>
  controller.getPreview(req, res)
);

/**
 * @route GET /${route}/:name/published/latest(\.json)?
 * @description Get the latest published version of a map instance by name
 * @param {string} name - The map instance name
 * @returns {PublishedMapConfigDto}
 */
router.get(`/${route}/:name/published/latest(\.json)?`, (req, res) => {
  controller.getLatestPublished(req, res);
});

/**
 * @route GET /${route}/published/:id(\.json)?
 * @description Get a specific published map instance
 * @param {string} id - The published map instance ID
 * @returns {PublishedMapConfigDto}
 */
router.get(`/${route}/published/:id(\.json)?`, (req, res) =>
  controller.getPublished(req, res)
);

/**
 * @route GET /${route}/:id/published/list
 * @description Get a list of published versions for a specific map instance
 * @param {string} id - The map instance ID
 * @returns {PublishedMapListItemDto[]}
 */
router.get(`/${route}/:id/published/list`, (req, res) =>
  controller.getPublishedList(req, res)
);

/**
 * @route GET /${route}/:id
 * @description Get a specific map instance
 * @param {string} id - The map instance ID
 * @returns {MapInstanceDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.getById(req, res));

/**
 * @route GET /${route}
 * @description Get all map instances
 * @returns {MapInstanceListItemDto[]}
 */
router.get(`/${route}`, (req, res) => controller.getAll(req, res));

/**
 * @route POST /${route}
 * @description Create a new map instance
 * @request {request} requestBody - The map instance data to create
 * @returns {response}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route POST /${route}/:id/publish
 * @description Publish a specific map instance
 * @param {string} id - The map instance ID
 * @request {MapInstanceDto} requestBody - The map instance data to publish
 * @returns {MapInstanceDto}
 */
router.post(`/${route}/:id/publish`, (req, res) =>
  controller.publish(req, res)
);

/**
 * @route POST /${route}/:id/republish/:instanceId
 * @description Republish a specific version of a map instance
 * @param {string} id - The map instance ID
 * @param {string} instanceId - The specific instance ID to republish
 * @returns {PublishedMapConfigDto}
 */
router.post(`/${route}/:id/republish/:instanceId`, (req, res) =>
  controller.republish(req, res)
);

/**
 * @route PUT /${route}/layer/:type/:id/sync
 * @description Synchronize a specific layer in map instances
 * @param {MapInstanceDto} type - The layer type
 * @param {MapInstanceDto} id - The layer ID
 * @returns {response}
 */
router.put(`/${route}/layer/:type/:id/sync`, (req, res) =>
  controller.syncLayer(req, res)
);

/**
 * @route PUT /${route}/:id
 * @description Update a specific map instance
 * @param {string} id - The map instance ID
 * @request {MapInstanceDto} requestBody - The updated map instance data
 * @returns {MapInstanceDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @description Delete a specific map instance
 * @param {string} id - The map instance ID
 * @returns {MapInstanceDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);

export default router;
