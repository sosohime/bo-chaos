import { Module } from '@nestjs/common';
import { GlobalController } from './global.controller';

@Module({
  controllers: [GlobalController],
})
export class GlobalModule {}
