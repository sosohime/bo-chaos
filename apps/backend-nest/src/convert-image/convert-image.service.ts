import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class ConvertImageService {
  private semaphore: Promise<void>[] = [];

  constructor(private readonly configService: ConfigService) {}

  private async acquireSemaphore(): Promise<() => void> {
    while (
      this.semaphore.length >= this.configService.maxConcurrentConversions
    ) {
      await Promise.race(this.semaphore);
    }

    let resolve: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    this.semaphore.push(promise);

    return () => {
      const index = this.semaphore.indexOf(promise);
      if (index > -1) {
        this.semaphore.splice(index, 1);
      }
      resolve();
    };
  }

  async convertImage(
    file: Express.Multer.File,
  ): Promise<{ success: boolean; message: string; outputPath?: string }> {
    const release = await this.acquireSemaphore();

    try {
      const timestamp = Date.now();
      const inputPath = path.join(
        process.cwd(),
        `${path.parse(file.originalname).name}-${timestamp}${path.parse(file.originalname).ext}`,
      );
      const outputPath = path.join(
        process.cwd(),
        `${path.parse(file.originalname).name}-${timestamp}.jpeg`,
      );

      await fs.promises.writeFile(inputPath, file.buffer);

      try {
        const { stdout, stderr } = await execAsync(
          `darktable-cli "${inputPath}" "${outputPath}"`,
        );
        await fs.promises.unlink(inputPath);

        if (stdout.includes('exported') || stderr.includes('exported')) {
          return { success: true, message: '图片转换成功', outputPath };
        } else {
          await fs.promises.unlink(outputPath).catch(() => {});
          return { success: false, message: `转换失败: ${stderr || stdout}` };
        }
      } catch (error) {
        await fs.promises.unlink(inputPath).catch(() => {});
        return {
          success: false,
          message: `执行转换命令失败: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `文件处理失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    } finally {
      release();
    }
  }
}
