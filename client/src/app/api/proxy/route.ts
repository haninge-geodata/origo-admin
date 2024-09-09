import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ActorDto } from "@/shared/interfaces/dtos";

const API_ACCESS_TOKEN = process.env.PROTECTED_API_ACCESS_TOKEN;
const PROTECTED_ADMIN_ROLE = process.env.PROTECTED_ADMIN_ROLE;
const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
const ROLE_ROUTE = "permissions/roles/name/";
const BASE_URL = process.env.BASE_URL;

async function handler(req: NextRequest) {
  const { method } = req;
  const url = req.nextUrl.searchParams.get("url");
  const jwtPayload = await getToken({ req });
  if (!url || Array.isArray(url)) {
    return NextResponse.json(
      { error: "Missing or invalid url query parameter" },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  };

  //Verifiying the user
  if (AUTH_ENABLED && PROTECTED_ADMIN_ROLE !== null) {
    if (
      !jwtPayload ||
      (jwtPayload.access_token === null &&
        jwtPayload.access_token !== undefined)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const userInfo = await getUserInfo(jwtPayload.access_token as string);
      const userGroups = userInfo.groups || [];
      const username = userInfo.username || userInfo.name || userInfo.sub || "";
      const roleInfo = await getRoleInfo(PROTECTED_ADMIN_ROLE!);

      if (!roleInfo || !roleInfo.actors || roleInfo.actors.length === 0) {
        console.warn(
          "Warning: Empty role info, granting access, make sure the add the ADMIN Role to permissions!"
        );
      } else {
        const hasAccess = roleInfo.actors.some(
          (actor: ActorDto) =>
            (actor.type === "Group" && userGroups.includes(actor.name)) ||
            (actor.type === "User" && actor.name === username)
        );

        if (!hasAccess) {
          console.info("Access denied");
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        headers["X-User-Info"] = JSON.stringify(userInfo.sub);
      }
    } catch (error) {
      console.error("Error in authentication process:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_ACCESS_TOKEN}`,
    };

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
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    if (
      (response.status === 204 &&
        response.headers.get("Content-Length") === "0") ||
      response.headers.get("Content-Length") === null ||
      (response.status === 200 && response.statusText === "No Content")
    ) {
      return new NextResponse(null, { status: response.status });
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
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

async function getWellKnownConfig() {
  const wellKnownUrl = process.env.PROTECTED_IDP_WELL_KNOWN;
  if (!wellKnownUrl) {
    throw new Error("Well-known URL is not configured");
  }

  const response = await fetch(wellKnownUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch well-known config: ${response.statusText}`
    );
  }

  return await response.json();
}

async function getUserInfo(access_Token: string) {
  const wellKnownConfig = await getWellKnownConfig();
  const userInfoEndpoint = wellKnownConfig.userinfo_endpoint;
  if (!userInfoEndpoint) {
    throw new Error("User info endpoint not found in well-known config");
  }
  const response = await fetch(userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${access_Token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }
  return await response.json();
}

async function getRoleInfo(roleName: string) {
  const roleUrl = `${BASE_URL}${ROLE_ROUTE}${roleName}`;
  const response = await fetch(roleUrl, {
    headers: {
      Authorization: `Bearer ${API_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch role info: ${response.statusText}`);
  }

  return await response.json();
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
