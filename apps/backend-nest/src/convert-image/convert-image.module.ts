import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConvertImageController } from './convert-image.controller';
import { ConvertImageService } from './convert-image.service';

@Module({
  imports: [ConfigModule],
  controllers: [ConvertImageController],
  providers: [ConvertImageService],
})
export class ConvertImageModule {}
