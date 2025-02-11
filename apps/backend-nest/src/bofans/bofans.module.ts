import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KowtowModule } from './kowtow/kowtow.module';
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [AuthModule, UsersModule, KowtowModule, PhotoModule],
})
export class BofansModule {}
