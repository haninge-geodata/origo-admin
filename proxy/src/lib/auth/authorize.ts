import { Request, Response } from "express";
import { getOpenidClient } from "./openidIssuer";

export const authorize = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await getOpenidClient();
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: process.env.REDIRECT_URI,
      scope: process.env.SCOPE,
      state: req.query.state as string,
    });
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error(`[${Date.now()}] Authorization error:`, error);
    res.status(500).send("Authorization error");
  }
};
