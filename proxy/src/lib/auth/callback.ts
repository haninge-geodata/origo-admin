import { Request, Response } from "express";
import { getOpenidClient } from "./openidIssuer";

export const callback = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await getOpenidClient();
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      throw new Error("No code received from the OpenID provider");
    }

    const tokenSet = await client.callback(process.env.REDIRECT_URI, { code, state: state as string }, { state: state as string });

    const userInfo = await client.userinfo(tokenSet.access_token!);

    res.json({
      message: "Authentication successful",
      access_token: tokenSet.access_token,
      id_token: tokenSet.id_token,
      refresh_token: tokenSet.refresh_token,
      expires_at: tokenSet.expires_at,
      userInfo: userInfo,
    });
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ error: "Authentication failed", details: error instanceof Error ? error.message : "Unknown error" });
  }
};
