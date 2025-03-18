import jwt from "jsonwebtoken";

export type accessToken = {
  value: string;
  expiresIn: number;
};

export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error(`[${Date.now()}] Error decoding token:`, error);
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
  console.warn(`[${Date.now()}] No groups found in token or unexpected format`);
  return [];
}

export function extractTokenFromRequest(req: any): accessToken | null {
  const cookies = req.cookies;

  if (cookies && cookies.oidc_access_token && cookies.oidc_access_token_expires_in) {
    return { value: cookies.oidc_access_token, expiresIn: cookies.oidc_access_token_expires_in };
  }

  // if no auth in cookies check the headers
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return { value: authHeader.substring(7), expiresIn: 0 };
  }
  // If no auth header, check the session
  if (req.session && (req.session as any).accessToken) {
    const expiresAt = (req.session as any).expires_in ? Date.now() + (req.session as any).expires_in * 1000 : 0;
    const token = (req.session as any).accessToken;

    return {
      value: (req.session as any).accessToken,
      expiresIn: (req.session as any).expires_in ? Date.now() + (req.session as any).expires_in * 1000 : 0,
    };
  } else {
    console.log(`[${Date.now()}] No token found in session`);
  }

  return null;
}
