import jwt from "jsonwebtoken";

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

export function extractTokenFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}
