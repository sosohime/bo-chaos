import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConvertImageService } from './convert-image.service';

@Controller('convert-image')
export class ConvertImageController {
  constructor(private readonly convertImageService: ConvertImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.convertImageService.convertImage(file);
  }
}
