import { permanentRedirectResponse } from "@/lib/permanent-redirect";

export function GET(request: Request) {
  return permanentRedirectResponse(request, "/cookies");
}

export const HEAD = GET;
