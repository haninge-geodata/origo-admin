import { Request, Response } from "express";
import { getOpenidClient } from "./openidIssuer";

export const authorize = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await getOpenidClient();
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: process.env.REDIRECT_URI,
      scope: "openid",
      state: req.query.state ? String(req.query.state) : "just-in",
    });
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).send("Authorization error");
  }
};
