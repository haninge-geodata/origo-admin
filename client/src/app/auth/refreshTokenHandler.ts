import axios from "axios";
import { JWT } from "next-auth/jwt";

type RefreshTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
};

export async function refreshAccessToken(token: JWT, scope: string, access_token_url: string, clientId: string, clientSecret: string): Promise<RefreshTokenResponse> {
  const refreshToken = token.refreshToken as string;
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("scope", scope);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  try {
    const response = await axios.post<RefreshTokenResponse>(access_token_url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error refreshing OAuth token: ${error}`);
    let errorMessage = "An unknown error occurred";
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || error.message;
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
    };
  }
}
