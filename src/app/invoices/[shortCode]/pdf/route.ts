import { NextRequest, NextResponse } from "next/server";

// See server-api.ts: SERVER_API_URL is a runtime-only override for this
// server's own fetches, used when NEXT_PUBLIC_API_URL (frozen into the JS
// bundle at build time) isn't reachable from inside this process.
const BASE_URL = (process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

// Public proxy so shared invoice links (WhatsApp, etc.) point at our own
// domain instead of leaking the backend API host. Not under /admin — this
// must stay reachable by anyone with the link, no admin session required.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  const res = await fetch(`${BASE_URL}/invoices/${encodeURIComponent(shortCode)}/pdf/`);
  if (!res.ok) {
    return new NextResponse("Invoice not found.", { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? `inline; filename="invoice-${shortCode}.pdf"`,
    },
  });
}
