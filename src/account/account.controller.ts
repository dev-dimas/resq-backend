import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Account } from '@prisma/client';
import { AuthUser } from 'src/common/auth.decorator';
import {
  ChangePasswordRequest,
  EditAvatarRequest,
  EditProfileRequest,
  EditProfileResponse,
  LoginAccountRequest,
  LoginAccountResponse,
  RegisterAccountRequest,
  RegisterAccountResponse,
} from 'src/model/account.model';
import { WebResponse } from 'src/model/web.model';
import { AccountService } from './account.service';

@Controller('account')
@ApiTags('Account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('register')
  async register(
    @Body() request: RegisterAccountRequest,
  ): Promise<WebResponse<RegisterAccountResponse>> {
    const result = await this.accountService.register(request);

    return {
      message: 'Account successfully created!',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() request: LoginAccountRequest,
  ): Promise<WebResponse<LoginAccountResponse>> {
    const result = await this.accountService.login(request);

    return { data: result };
  }

  @Post('edit')
  @HttpCode(200)
  @ApiBearerAuth()
  async editProfile(
    @AuthUser() account: Account,
    @Body() request: EditProfileRequest,
  ): Promise<WebResponse<EditProfileResponse>> {
    const result = await this.accountService.editProfile(request, account);
    return { message: 'Account updated successfully!', data: result };
  }

  @Post('avatar')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 4000000, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: EditAvatarRequest,
  })
  @ApiBearerAuth()
  async editAvatar(
    @AuthUser() account: Account,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<WebResponse<Record<any, string>>> {
    if (!avatar) throw new BadRequestException('Avatar field is required!');

    await this.accountService.editAvatar(account, avatar);

    return { message: 'Avatar updated successfully!' };
  }

  @Delete('avatar')
  @ApiBearerAuth()
  async deleteAvatar(
    @AuthUser() account: Account,
  ): Promise<WebResponse<Record<any, string>>> {
    await this.accountService.deleteAvatar(account);

    return { message: 'Avatar deleted successfully!' };
  }

  @Post('change-password')
  @HttpCode(200)
  @ApiBearerAuth()
  async changePassword(
    @AuthUser() account: Account,
    @Body() request: ChangePasswordRequest,
  ): Promise<WebResponse<Record<any, string>>> {
    await this.accountService.changePassword(request, account);

    return { message: 'Password updated successfully!' };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  async logout(
    @AuthUser() account: Account,
  ): Promise<WebResponse<Record<any, string>>> {
    await this.accountService.logout(account);

    return {
      message: 'Logout success',
    };
  }
}
