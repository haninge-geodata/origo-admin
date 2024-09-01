import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: NextRequest) {
  noStore();

  const envName = request.nextUrl.searchParams.get("name") as string;
  if (envName.includes("PROTECTED_" || envName.includes("NEXTAUTH_"))) {
    return new Response("", { status: 200 });
  }

  const apiUrl = process.env[envName];
  return new Response(apiUrl, { status: 200 });
}
