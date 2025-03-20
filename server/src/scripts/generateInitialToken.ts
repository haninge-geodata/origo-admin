import { TokenUtils } from "../utils/accessTokenUtils";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AccessTokenModel } from "../models";

dotenv.config();

async function generateInitialToken() {
  await mongoose.connect(process.env.DATABASE as string);

  const tokenId = TokenUtils.generateTokenId();
  const expiresAt = new Date(Date.now() + 99999 * 24 * 60 * 60 * 1000);
  const permissions = ["*"];

  const token = TokenUtils.generateAccessToken(tokenId, expiresAt, permissions);
  const _id = new mongoose.Types.ObjectId();
  await AccessTokenModel.create({
    _id,
    tokenId,
    name: "Initial Super Admin Token",
    expiresAt,
    isValid: true,
    permissions,
  });

  console.info(`[${new Date().toISOString()}] Initial Super Admin Token created`);
  console.info(`[${new Date().toISOString()}] API_ACCESS_TOKEN=${token}`);

  console.info(`[${new Date().toISOString()}] Please store this token securely. It will not be shown again.`);

  await mongoose.disconnect();
}

generateInitialToken().catch(console.error);
