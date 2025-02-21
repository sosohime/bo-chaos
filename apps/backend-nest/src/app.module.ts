import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvertImageModule } from './convert-image/convert-image.module';
import { BofansModule } from './bofans/bofans.module';

@Module({
  imports: [ConvertImageModule, BofansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
