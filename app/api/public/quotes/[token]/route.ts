import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const res = await fetch(`${BACKEND}/api/public/quotes/${params.token}`, {
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}