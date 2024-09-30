import jwt from "jsonwebtoken";

export type accessToken = {
  value: string;
  expiresAt: number;
};

export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function extractGroups(token: string): string[] {
  const decodedToken = decodeToken(token);
  let groups: string[] = [];

  if (decodedToken && decodedToken.groups) {
    if (typeof decodedToken.groups === "string") {
      groups = decodedToken.groups.split(",").map((group: string) => group.trim());
    } else if (Array.isArray(decodedToken.groups)) {
      groups = decodedToken.groups;
    }

    if (decodedToken.name) {
      groups.push(decodedToken.name);
    }

    if (groups.length > 0) {
      return groups;
    }
  }
  console.warn("No groups found in token or unexpected format");
  return [];
}

export const simulatedToken: accessToken = {
  value: "",
  expiresAt: Date.now() + 7200 * 1000, // 2 hours from now
};

export function extractTokenFromRequest(req: any): accessToken | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    //TODO: Check if token is expired!!"!"
    //return authHeader.substring(7);
    return { value: authHeader.substring(7), expiresAt: 0 };
  }

  // If not found in header, try to extract from cookie
  const cookies = parseCookies(req.headers.cookie);
  console.log("Cookies:", req.headers.cookies);

  const cookieToken = cookies["OIDC_AUTH_CODE"];
  const expires = cookies["OIDC_ACCESS_TOKEN_EXPIRES"];

  console.log("Cookie token:", cookies);
  if (cookieToken) {
    return { value: cookieToken, expiresAt: expires ? parseInt(expires) : 600 };
  }

  // TODO: If token is not found, return the simulated token if it's not expired
  if (Date.now() < simulatedToken.expiresAt) {
    console.log("Returning simulated token");
    return simulatedToken;
  }

  return null;
}

function parseCookies(cookieHeader: string | undefined): {
  [key: string]: string;
} {
  const cookies: { [key: string]: string } = {};

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const key = parts.shift()?.trim();
      const value = decodeURIComponent(parts.join("="));
      if (key) {
        cookies[key] = value;
      }
    });
  }
  return cookies;
}
