import Taro from "@tarojs/taro";
import { orientedImageSize } from "./background-crop";

const MAX_EDGE = 1440;
const MAX_BYTES = 1024 * 1024;

export async function prepareBackgroundImage(
  path: string,
  size: { width: number; height: number },
): Promise<string> {
  const input = await Taro.getFileInfo({ filePath: path });
  if (!("size" in input)) throw new Error("暂时无法读取这张图片，请重选");
  const bytes = input.size;
  const edge = Math.max(size.width, size.height);
  if (edge <= MAX_EDGE && bytes <= 192 * 1024) return path;
  for (const limit of [MAX_EDGE, 960]) {
    try {
      const longerSide = size.width >= size.height ? "compressedWidth" : "compressedHeight";
      const { tempFilePath } = await Taro.compressImage({
        src: path,
        quality: 74,
        [longerSide]: Math.min(limit, edge),
      });
      const [file, info] = await Promise.all([
        Taro.getFileInfo({ filePath: tempFilePath }),
        Taro.getImageInfo({ src: tempFilePath }),
      ]);
      const output = orientedImageSize(info.width, info.height, info.orientation);
      const ratio = (output.width * size.height) / (output.height * size.width);
      if (
        "size" in file &&
        Math.max(output.width, output.height) <= MAX_EDGE &&
        file.size <= MAX_BYTES &&
        Math.abs(ratio - 1) < 0.03 &&
        (edge > MAX_EDGE || file.size < bytes)
      ) return tempFilePath;
    } catch {
      // A small source can still be uploaded if native compression fails.
    }
  }
  if (edge <= MAX_EDGE && bytes <= MAX_BYTES) return path;
  throw new Error("图片太大，压缩后仍无法上传，请换一张较小的图片");
}
