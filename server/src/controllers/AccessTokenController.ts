import { AccessTokenService } from "../services/";
import { BaseController } from "./BaseController";

const accessTokenController = new BaseController(new AccessTokenService());
export { accessTokenController };
