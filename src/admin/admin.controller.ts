import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { WebResponse } from 'src/model/web.model';
import { AuthAdmin } from 'src/common/auth.decorator';
import { BanAccountRequest } from 'src/model/admin.model';
import { Account } from '@prisma/client';

@Controller()
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('ban')
  @HttpCode(200)
  async banAccount(
    @AuthAdmin() _: Account,
    @Body() request: BanAccountRequest,
  ): Promise<WebResponse> {
    await this.adminService.banAccount(request);
    return {
      message: `Successfully banned the account with id ${request.accountId}.`,
    };
  }

  @Post('unban')
  @HttpCode(200)
  async unbanAccount(
    @AuthAdmin() _: Account,
    @Body() request: BanAccountRequest,
  ): Promise<WebResponse> {
    await this.adminService.unbanAccount(request);
    return {
      message: `Successfully unbanned the account with id ${request.accountId}.`,
    };
  }
}
