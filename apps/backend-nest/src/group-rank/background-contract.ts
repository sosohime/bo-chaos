import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type { GroupRankBackgroundChoice, GroupRankCrop } from '@mono/types';
class CropBody {
  @IsNumber() @Min(0) @Max(1) x!: number;
  @IsNumber() @Min(0) @Max(1) y!: number;
  @IsNumber() @Min(1) @Max(2) zoom!: number;
}
export class BackgroundBody {
  @IsUUID() assetId!: string;
  @IsDefined() @ValidateNested() @Type(() => CropBody) cover!: CropBody;
  @IsDefined() @ValidateNested() @Type(() => CropBody) card!: CropBody;
  @IsNumber() @Min(0.25) @Max(0.8) dim!: number;
}
export function normalizeBackground(
  input: GroupRankBackgroundChoice | null,
): GroupRankBackgroundChoice | null {
  if (input === null) return null;
  const crop = (c: GroupRankCrop) => {
    if (
      !c ||
      ![c.x, c.y, c.zoom].every(Number.isFinite) ||
      c.x < 0 ||
      c.x > 1 ||
      c.y < 0 ||
      c.y > 1 ||
      c.zoom < 1 ||
      c.zoom > 2
    )
      throw new BadRequestException('背景裁切位置无效');
    // Dragging produces binary fractions; persist a stable precision for retries.
    return {
      x: Number(c.x.toFixed(6)),
      y: Number(c.y.toFixed(6)),
      zoom: Number(c.zoom.toFixed(6)),
    };
  };
  if (
    !input ||
    typeof input.assetId !== 'string' ||
    !/^[a-f0-9-]{36}$/i.test(input.assetId) ||
    !Number.isFinite(input.dim) ||
    input.dim < 0.25 ||
    input.dim > 0.8
  )
    throw new BadRequestException('背景设置无效');
  return {
    assetId: input.assetId,
    cover: crop(input.cover),
    card: crop(input.card),
    dim: Number(input.dim.toFixed(6)),
  };
}
