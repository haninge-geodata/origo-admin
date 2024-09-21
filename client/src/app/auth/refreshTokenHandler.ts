import { JWT } from "next-auth/jwt";

type RefreshTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
};

export async function refreshAccessToken(token: JWT, clientId: string, clientSecret: string): Promise<RefreshTokenResponse> {
  const refreshToken = token.refreshToken as string;
  const access_token_url = token.access_token_url as string;

  const formBody = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "openid email groups oauth",
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  try {
    const response = await fetch(access_token_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const data: RefreshTokenResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  } catch (error) {
    console.error("Error refreshing OAuth token:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
