import { Test, TestingModule } from '@nestjs/testing';
import { ConvertImageController } from './convert-image.controller';
import { ConfigService } from '../config/config.service';
import { ConvertImageService } from './convert-image.service';
import * as path from 'path';
import * as fs from 'fs';

describe('ConvertImageController', () => {
  let controller: ConvertImageController;
  let service: ConvertImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvertImageController],
      providers: [ConvertImageService, ConfigService],
    }).compile();

    controller = module.get<ConvertImageController>(ConvertImageController);
    service = module.get<ConvertImageService>(ConvertImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('convertToJpeg', () => {
    it('should convert ARW file to JPEG', async () => {
      // 准备测试文件
      const testFilePath = path.join(__dirname, '../../生成单测.ARW');
      const file = {
        fieldname: 'file',
        originalname: '生成单测.ARW',
        encoding: '7bit',
        mimetype: 'image/x-sony-arw',
        buffer: fs.readFileSync(testFilePath),
        size: fs.statSync(testFilePath).size,
      };

      // 执行转换
      const result = await controller.uploadFile(file as Express.Multer.File);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('outputPath');
      expect(result.outputPath).toMatch(/\.jpeg$/);

      // 验证生成的文件是否存在
      const outputPath = result.outputPath?.replace('/api/images/', '') || '';
      expect(
        fs.existsSync(path.join(process.cwd(), 'uploads', outputPath)),
      ).toBe(true);
    });

    it('should handle invalid file format', async () => {
      const invalidFile = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
        size: 4,
      };

      await expect(
        controller.uploadFile(invalidFile as Express.Multer.File),
      ).rejects.toThrow();
    });
  });
});
