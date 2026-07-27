import { permanentRedirectResponse } from "@/lib/permanent-redirect";

export function GET(request: Request) {
  return permanentRedirectResponse(request, "/privacy");
}

export const HEAD = GET;
