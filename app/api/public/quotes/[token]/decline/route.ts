import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/public/quotes/${token}/decline`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}