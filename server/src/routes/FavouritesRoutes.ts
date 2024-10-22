import { Router } from "express";
import { favouritesController as controller } from "../controllers";
import { createSecureRouter, RouteRegistry } from "@/utils/routeUtils";

const route = "favourites";
const router = process.env.SECURE_FAVOURITES === 'true' ?
  createSecureRouter(route) :  Router();

/**
 * @route GET /${route}/list/{user}
 * @param {string} user - The user ID
 * @returns {FavouritesDto[]}
 */
router.get(`/${route}/list/:user`, (req, res) =>
  controller.getByUser(req, res)
);

/**
 * @route GET /${route}/:id
 * @param {string} id - The favourite ID
 * @returns {FavouritesDto}
 */
router.get(`/${route}/:id`, (req, res) => controller.getById(req, res));

/**
 * @route POST /${route}/
 * @request {FavouritesDto} requestBody - The favourite data to create
 * @returns {FavouritesDto}
 */
router.post(`/${route}`, (req, res) => controller.create(req, res));

/**
 * @route PUT /${route}/:id
 * @param {string} id - The favourite ID
 * @request {FavouritesDto} requestBody - The updated favourite data
 * @returns {FavouritesDto}
 */
router.put(`/${route}/:id`, (req, res) => controller.update(req, res));

/**
 * @route DELETE /${route}/:id
 * @param {string} id - The favourite ID
 * @returns {FavouritesDto}
 */
router.delete(`/${route}/:id`, (req, res) => controller.deleteById(req, res));

RouteRegistry.registerRoutes(router, route);
export default router;
