import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { GroupRankTitleArt } from '@mono/types';
import { PrismaService } from '@/library/prisma.service';
import type { GroupRankIdentity } from './group-auth.service';
import { renderTitleArt, TITLE_ART_VERSION } from './title-art-renderer';
import { supportsTitle } from './title-art-font';

@Injectable()
export class GroupRankTitleArtService {
  private readonly cache = new Map<string, GroupRankTitleArt>();
  private readonly pending = new Map<string, Promise<GroupRankTitleArt>>();
  private cachedBytes = 0;
  constructor(private readonly prisma: PrismaService) {}

  async get(
    identity: GroupRankIdentity,
    boardId: string,
  ): Promise<GroupRankTitleArt> {
    // Authorize on every read, including cache hits and boards since deleted.
    const board = await this.prisma.groupRankBoard.findFirst({
      where: { id: boardId, spaceId: identity.spaceId, deletedAt: null },
      select: { templateSnapshot: true },
    });
    if (!board) throw new NotFoundException('本群中没有这个榜单');
    const name = (board.templateSnapshot as { name?: unknown })?.name;
    if (typeof name !== 'string' || !name || Array.from(name).length > 24)
      throw new ServiceUnavailableException('榜名暂时无法绘制');
    const key = createHash('sha256')
      .update(`${TITLE_ART_VERSION}\0${name}`)
      .digest('hex');
    const existing = this.cache.get(key);
    if (existing) {
      this.cache.delete(key);
      this.cache.set(key, existing);
      return existing;
    }
    const same = this.pending.get(key);
    if (same) return same;
    if (this.pending.size >= 4)
      throw new ServiceUnavailableException('标题正在绘制，请稍后再试');
    const work = this.render(name)
      .then((result) => {
        const bytes = result.imageDataUri?.length ?? 0;
        while (
          this.cache.size &&
          (this.cache.size >= 64 || this.cachedBytes + bytes > 8 * 1024 * 1024)
        ) {
          const oldest = this.cache.keys().next().value!;
          this.cachedBytes -= this.cache.get(oldest)!.imageDataUri?.length ?? 0;
          this.cache.delete(oldest);
        }
        this.cache.set(key, result);
        this.cachedBytes += bytes;
        return result;
      })
      .finally(() => this.pending.delete(key));
    this.pending.set(key, work);
    return work;
  }

  private async render(name: string): Promise<GroupRankTitleArt> {
    if (!(await supportsTitle(name)))
      return {
        name,
        version: TITLE_ART_VERSION,
        imageDataUri: null,
        width: 0,
        height: 0,
      };
    const result = await renderTitleArt(name);
    return {
      name,
      version: TITLE_ART_VERSION,
      imageDataUri: `data:image/png;base64,${result.image.toString('base64')}`,
      width: result.width,
      height: result.height,
    };
  }
}
