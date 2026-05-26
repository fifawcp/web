import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM = process.env.BACKEND_API_URL;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ProxyOptions = {
  path: string;
  method: Method;
  revalidate?: readonly string[];
  search?: URLSearchParams;
};

export async function proxyToBackend(req: NextRequest, options: ProxyOptions): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const headers: HeadersInit = {};
  if (auth) headers.Authorization = auth;

  const init: RequestInit = { method: options.method, headers };

  const hasBody = options.method !== "GET" && options.method !== "DELETE";
  if (hasBody) {
    const raw = await req.text();
    if (raw.length > 0) {
      init.body = raw;
      (headers as Record<string, string>)["Content-Type"] = req.headers.get("content-type") ?? "application/json";
    }
  }

  const search = options.search ?? new URL(req.url).searchParams;
  const qs = search.toString();
  const url = `${UPSTREAM}${options.path}${qs ? `?${qs}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    return NextResponse.json({ error: { code: "NETWORK_ERROR", message: "Upstream unreachable", requestId: "", fields: undefined } }, { status: 502 });
  }

  if (response.ok && options.revalidate?.length) {
    for (const tag of options.revalidate) revalidateTag(tag, { expire: 0 });
  }

  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
