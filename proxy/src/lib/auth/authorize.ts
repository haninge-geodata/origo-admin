import { Request, Response } from "express";
import { getOpenidClient } from "./openidIssuer";

export const authorize = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await getOpenidClient();
    console.log("authorize");

    // Decode the state parameter
    const decodedState = JSON.parse(Buffer.from(req.query.state as string, "base64").toString());
    const { originalUrl, clientId } = decodedState;
    console.log(decodedState);
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: process.env.REDIRECT_URI,
      scope: process.env.SCOPE,
      state: req.query.state as string, // Pass through the entire encoded state
    });
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).send("Authorization error");
  }
};
