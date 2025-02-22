import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KowtowModule } from './kowtow/kowtow.module';
import { PhotoModule } from './photo/photo.module';
import { CategoryModule } from './category/category.module';
import { GlobalModule } from './global/global.module';

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    UsersModule,
    KowtowModule,
    PhotoModule,
    CategoryModule,
  ],
})
export class BofansModule {}
