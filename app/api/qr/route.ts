import QRCode from "qrcode";

const MAX_QR_VALUE_LENGTH = 2_048;

function asSafeHttpUrl(value: string | null) {
  if (!value || value.length > MAX_QR_VALUE_LENGTH) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("slug");
  const profileUrl = slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)
    ? new URL(`/portofoliu/${slug}`, requestUrl.origin).toString()
    : requestUrl.searchParams.get("value");
  const url = asSafeHttpUrl(profileUrl);
  if (!url) {
    return Response.json({ error: "Adresa profilului este invalidă." }, { status: 400 });
  }

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#003747", light: "#FFFFFF" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
