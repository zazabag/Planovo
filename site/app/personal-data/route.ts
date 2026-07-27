import { permanentRedirectResponse } from "@/lib/permanent-redirect";

export function GET(request: Request) {
  return permanentRedirectResponse(request, "/consent-pdn");
}

export const HEAD = GET;
