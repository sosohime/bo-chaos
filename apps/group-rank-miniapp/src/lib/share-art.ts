import Taro from "@tarojs/taro";
import { newRequestId } from "./api";

const width = 500;
const height = 400;
const shareImagePrefix = "notebook-share-v2-";
const retainedShareImages = 24;

function saveShareImage(directory: string, content: string) {
  const fs = Taro.getFileSystemManager();
  const name = `${shareImagePrefix}${newRequestId()}.png`;
  const path = `${directory}/${name}`;

  // WeChat can read the file after the share handler returns. Each share needs its own snapshot.
  fs.writeFileSync(path, content, "base64");
  try {
    const previous = fs.readdirSync(directory)
      .filter(file => file !== name && file.startsWith(shareImagePrefix) && file.endsWith(".png"))
      .sort();
    for (const stale of previous.slice(0, -(retainedShareImages - 1))) {
      fs.unlinkSync(`${directory}/${stale}`);
    }
  } catch {
    // A cleanup error does not invalidate the newly exported image.
  }
  return path;
}

function label(ctx: CanvasRenderingContext2D, text: string, size: number, x: number, y: number, max = 410) {
  ctx.font = `bold ${size}px sans-serif`;
  ctx.fillText(text, x, y, max);
}

function boardLines(ctx: CanvasRenderingContext2D, title: string) {
  ctx.font = "bold 50px sans-serif";
  const lines: string[] = [""];
  for (const ch of title) {
    const last = lines.length - 1;
    if (lines[last] && ctx.measureText(lines[last] + ch).width > 390 && last < 2) lines.push(ch);
    else lines[last] += ch;
  }
  return lines;
}

function draw(ctx: CanvasRenderingContext2D, title: string, rank?: number, score?: string) {
  const accent = rank ? "#ffdb78" : "#c6f45d";
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, rank ? "#39261b" : "#15241f");
  gradient.addColorStop(1, "#10171b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(307 + i * 26, 20);
    ctx.lineTo(486, 190 - i * 24);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#78817a";
  ctx.lineWidth = 1;
  ctx.strokeRect(18.5, 18.5, 463, 363);
  ctx.fillStyle = accent;
  ctx.fillRect(18, 29, 4, 62);
  ctx.textBaseline = "middle";
  label(ctx, rank ? "我的排名" : "本群榜单", 27, 44, 67);
  ctx.fillStyle = "#f8f4e9";
  if (rank) {
    ctx.fillStyle = accent;
    label(ctx, `第 ${rank} 名`, 104, 44, 178);
    ctx.fillStyle = "#f8f4e9";
    label(ctx, title, 34, 44, score ? 244 : 273);
    if (score) label(ctx, score, 28, 44, 286);
  } else {
    const lines = boardLines(ctx, title);
    const size = lines.length === 1 ? 87 : lines.length === 2 ? 60 : 49;
    const step = size + 8;
    lines.forEach((line, i) => label(ctx, line, size, 44, 193 + (i - (lines.length - 1) / 2) * step, 398));
  }
  ctx.fillStyle = accent;
  ctx.fillRect(44, 314, 412, 2);
  ctx.fillStyle = "#e4e9de";
  label(ctx, "博哥的小本儿", 23, 44, 348);
}

export function prepareShareArt(title: string, rank?: number, score?: string) {
  const canvas = Taro.createOffscreenCanvas({ type: "2d", width, height });
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  if (!ctx) throw new Error("Cannot draw share card");
  draw(ctx, title, rank, score);
  try {
    // Export synchronously when supported, so WeChat needn't wait to open the picker.
    const data = (canvas as unknown as HTMLCanvasElement).toDataURL("image/png");
    const content = data.split(",")[1];
    if (!content || !Taro.env?.USER_DATA_PATH) throw new Error("No local export");
    return saveShareImage(Taro.env.USER_DATA_PATH, content);
  } catch {
    return Taro.canvasToTempFilePath({
      canvas: canvas as unknown as Taro.Canvas, width, height, destWidth: width, destHeight: height, fileType: "png",
    }).then(({ tempFilePath }) => tempFilePath);
  }
}
