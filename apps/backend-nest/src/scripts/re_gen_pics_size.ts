import { PrismaService } from '@/library/prisma.service';
import { photo as photoUtils } from '@mono/utils';
import * as sharp from 'sharp';
import axios from 'axios';

async function getImageSize(
  url: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error(`获取图片尺寸失败: ${url}`, error);
    return null;
  }
}

async function main() {
  const prismaService = new PrismaService();

  // 获取全部图片
  const photos = await prismaService.photo.findMany();

  // 过滤出非标准文件名的
  const reGenList = photos.filter((p) => {
    const info = photoUtils.getStandardPictureInfo(p.filename);
    return !info?.height || !info?.width;
  });

  console.log(`需要处理的图片数量: ${reGenList.length}`);

  // 批量处理图片
  for (const photo of reGenList) {
    try {
      console.log(`处理图片: ${photo.filename}`);
      const photoInfo = photoUtils.getStandardPictureInfo(photo.filename)!;
      console.log(`图片信息: ${JSON.stringify(photoInfo)}`);
      // 获取图片尺寸
      const size = await getImageSize(photo.filename);

      if (size) {
        // 更新数据库
        await prismaService.photo.update({
          where: { id: photo.id },
          data: {
            filename: photoUtils.genStandardPictureName({
              ...photoInfo,
              height: size.height,
              width: size.width,
            }),
          },
        });
        console.log(
          `更新成功 - ID: ${photo.id}, 尺寸: ${size.width}x${size.height}`,
        );
      } else {
        console.error(`获取图片尺寸失败 - ID: ${photo.id}`);
      }
    } catch (error) {
      console.error(`处理图片失败 - ID: ${photo.id}`, error);
    }

    // 添加延迟，避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('所有图片处理完成');
  process.exit(0);
}

main().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
