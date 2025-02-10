import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KowtowModule } from './kowtow/kowtow.module';
// import { AuthService } from './auth/auth.service';
// import { UsersService } from './users/users.service';

@Module({
  imports: [AuthModule, UsersModule, KowtowModule],
})
export class BofansModule {}
