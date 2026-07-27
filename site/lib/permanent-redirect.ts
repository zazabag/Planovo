export function permanentRedirectResponse(
  request: Request,
  destination: `/${string}`,
) {
  return new Response(null, {
    status: 308,
    headers: {
      location: new URL(destination, request.url).toString(),
      "cache-control": "public, max-age=3600",
    },
  });
}
