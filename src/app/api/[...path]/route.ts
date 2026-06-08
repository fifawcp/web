import { NextRequest } from "next/server";

import { proxyToBackend } from "../_lib/proxy";

// Catch-all proxy for backend API paths that have no dedicated route handler
// (e.g. /api/matches, /api/standings, /api/dashboard, /api/players, /api/pickems).
// Runs in the Node runtime, so forwardedClientHeaders can attach the trusted
// X-Client-IP header — unlike a next.config rewrite, which drops proxy-set headers.
// More specific route handlers and the beforeFiles rewrites take precedence over this.
type Ctx = { params: Promise<{ path: string[] }> };

const backendPath = (segments: string[]) => `/api/${segments.join("/")}`;

export async function GET(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return proxyToBackend(req, { path: backendPath(path), method: "GET" });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return proxyToBackend(req, { path: backendPath(path), method: "POST" });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return proxyToBackend(req, { path: backendPath(path), method: "PUT" });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return proxyToBackend(req, { path: backendPath(path), method: "PATCH" });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return proxyToBackend(req, { path: backendPath(path), method: "DELETE" });
}
