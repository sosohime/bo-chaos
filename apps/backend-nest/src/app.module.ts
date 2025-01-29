import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvertImageModule } from './convert-image/convert-image.module';

@Module({
  imports: [ConvertImageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
