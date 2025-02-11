import {
  Controller,
  Get,
  Param,
  //   Post,
  //   Body,
  //   Put,
  //   Delete,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { PhotoService } from './photo/photo.service';
import {
  // User as UserModel,
  Photo as PhotoModel,
} from '@prisma/client';

@Controller()
export class BoFansController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly photoService: PhotoService,
  ) {}

  // @Get('photo/:id')
  // async getPostById(@Param('id') id: string): Promise<PhotoModel | null> {
  //   return this.photoService.photo({ id: Number(id) });
  // }

  //   @Get('feed')
  //   async getPublishedPosts(): Promise<PhotoModel[]> {
  //     return this.photoService.posts({
  //       where: { published: true },
  //     });
  //   }

  //   @Get('filtered-posts/:searchString')
  //   async getFilteredPosts(
  //     @Param('searchString') searchString: string,
  //   ): Promise<PhotoModel[]> {
  //     return this.photoService.posts({
  //       where: {
  //         OR: [
  //           {
  //             title: { contains: searchString },
  //           },
  //           {
  //             content: { contains: searchString },
  //           },
  //         ],
  //       },
  //     });
  //   }

  //   @Post('post')
  //   async createDraft(
  //     @Body() postData: { title: string; content?: string; authorEmail: string },
  //   ): Promise<PhotoModel> {
  //     const { title, content, authorEmail } = postData;
  //     return this.photoService.createPost({
  //       title,
  //       content,
  //       author: {
  //         connect: { email: authorEmail },
  //       },
  //     });
  //   }

  //   @Post('users')
  //   async signupUser(
  //     @Body() usersData: { name?: string; email: string },
  //   ): Promise<UserModel> {
  //     return this.usersService.createUser(usersData);
  //   }

  //   @Put('publish/:id')
  //   async publishPost(@Param('id') id: string): Promise<PhotoModel> {
  //     return this.photoService.updatePost({
  //       where: { id: Number(id) },
  //       data: { published: true },
  //     });
  //   }

  //   @Delete('post/:id')
  //   async deletePost(@Param('id') id: string): Promise<PhotoModel> {
  //     return this.photoService.deletePost({ id: Number(id) });
  //   }
}
