import "server-only";
import ImageKit from "imagekit";

if (
  !process.env.IMAGEKIT_PUBLIC_KEY ||
  !process.env.IMAGEKIT_PRIVATE_KEY ||
  !process.env.IMAGEKIT_URL_ENDPOINT
) {
  throw new Error("ImageKit env vars are not set");
}

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadPrivateCv(
  file: Buffer,
  fileName: string,
  folder = "/cv"
): Promise<{ filePath: string; fileName: string }> {
  const result = await imagekit.upload({
    file,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    filePath: result.filePath,
    fileName: result.name ?? fileName,
  };
}

export function getCvUrl(filePath: string): string {
  return imagekit.url({
    path: filePath,
    signed: false,
  });
}