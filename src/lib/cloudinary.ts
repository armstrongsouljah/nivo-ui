import crypto from "crypto";

function parseCloudinaryUrl() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) throw new Error("CLOUDINARY_URL is not set");
  const match = url.match(/^cloudinary:\/\/(\d+):([^@]+)@(.+)$/);
  if (!match) throw new Error("Invalid CLOUDINARY_URL format");
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

export function getCloudinaryCredentials() {
  return parseCloudinaryUrl();
}

export function signUploadParams(params: Record<string, string | number>): string {
  const { apiSecret } = parseCloudinaryUrl();
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha256").update(toSign + apiSecret).digest("hex");
}
