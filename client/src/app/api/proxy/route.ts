import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const API_ACCESS_TOKEN = process.env.PROTECTED_API_ACCESS_TOKEN;
const PROTECTED_ADMIN_ROLE = process.env.PROTECTED_ADMIN_ROLE;
const PROTECTED_AUTH_ENABLED = process.env.PROTECTED_AUTH_ENABLED === "true";

async function handler(req: NextRequest) {
  const { method } = req;
  const url = req.nextUrl.searchParams.get("url");
  const jwtPayload = await getToken({ req });

  if (!url || Array.isArray(url)) {
    return NextResponse.json({ error: "Missing or invalid url query parameter" }, { status: 400 });
  }

  if (PROTECTED_AUTH_ENABLED && PROTECTED_ADMIN_ROLE === null && PROTECTED_ADMIN_ROLE === "") {
    console.error("No admin group specified");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else if (PROTECTED_AUTH_ENABLED && PROTECTED_ADMIN_ROLE !== null) {
    //TODO: IMPLEMENT AUTHORIZATION LOGIC
    //PLACEHOLDER: Check if the user is in the admin group
    if (PROTECTED_ADMIN_ROLE !== "OrigoAdmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_ACCESS_TOKEN}`,
    };

    if (jwtPayload) {
      headers["X-User-Token"] = jwtPayload.id_token as string;
    }

    let response: Response;

    if (method === "GET" || method === "DELETE") {
      response = await fetch(url, {
        method,
        headers,
      });
    } else if (method === "POST" || method === "PUT") {
      const body = await req.json();
      response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });
    } else {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Handle empty responses
    if (
      (response.status === 204 && response.headers.get("Content-Length") === "0") ||
      response.headers.get("Content-Length") === null ||
      (response.status === 200 && response.statusText === "No Content")
    ) {
      return new NextResponse(null, { status: response.status });
    }

    // Handle JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

function extractGroups(token: string): string[] {
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

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
