import { NextRequest } from "next/server";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";

import { proxyToBackend } from "../../_lib/proxy";

export const POST = (req: NextRequest) => proxyToBackend(req, { path: "/api/boards/join", method: "POST", revalidate: [BOARDS_LIST_TAG] });
