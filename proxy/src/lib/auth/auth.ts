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

export function extractTokenFromRequest(req: any): accessToken | null {
  const cookies = req.cookies;
  if (cookies && cookies.access_token) {
    return { value: cookies.access_token, expiresAt: 0 };
  }
  // if no auth in cookies check the headers
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return { value: authHeader.substring(7), expiresAt: 0 };
  }
  // If no auth header, check the session
  if (req.session && (req.session as any).accessToken) {
    const expiresAt = (req.session as any).expires_in ? Date.now() + (req.session as any).expires_in * 1000 : 0;
    const token = (req.session as any).accessToken;

    return {
      value: (req.session as any).accessToken,
      expiresAt: (req.session as any).expires_in ? Date.now() + (req.session as any).expires_in * 1000 : 0,
    };
  } else {
    console.log("No token found in session");
  }

  return null;
}
