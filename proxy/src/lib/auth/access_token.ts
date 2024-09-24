import { Request, Response } from "express";
import { TokenSet } from "openid-client";
import { getOpenidClient } from "./openidIssuer";

export const access_token = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await getOpenidClient();
    const { code, refresh_token } = req.body;
    let tokenSet: TokenSet | null = null;

    if (code && refresh_token) {
      res.status(400).send("Bad Request: Send either code or refresh token. Not both.");
      return;
    }

    if (code) {
      tokenSet = await client.grant({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      });

      if (process.env.SET_ACCESS_TOKEN_COOKIE === "true") {
        res.cookie("OIDC_AUTH_CODE", code, {
          domain: process.env.AUTHORIZATION_CODE_COOKIE_DOMAIN,
          expires: new Date(tokenSet.expires_at! * 1000),
          httpOnly: true,
          path: "/",
          secure: true,
          sameSite: "lax",
        });
      }
    } else if (refresh_token) {
      tokenSet = await client.grant({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      });
    } else {
      res.status(400).send("Bad Request: Neither code nor refresh token found.");
      return;
    }

    if (!tokenSet) {
      throw new Error("Failed to obtain token set");
    }

    const userInfo = await client.userinfo(tokenSet.access_token!);

    res.json({
      authenticated: true,
      access_token: tokenSet.access_token,
      refresh_token: tokenSet.refresh_token,
      id_token: tokenSet.id_token,
      expires_at: tokenSet.expires_at,
      displayname: userInfo[process.env.DISPLAY_NAME as string],
    });
  } catch (error) {
    console.error("Access token error:", error);
    res.status(500).send("Access token error");
  }
};
