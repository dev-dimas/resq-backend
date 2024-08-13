import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
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

  @Post('customer/complaint/:complaintId/solve')
  @HttpCode(200)
  async solveComplaint(
    @AuthAdmin() _: Account,
    @Param('complaintId') complaintId: string,
  ): Promise<WebResponse> {
    await this.adminService.solveComplaint(complaintId);
    return {
      message: `Successfully solved the complaint with id ${complaintId}.`,
    };
  }

  @Get('account/:id')
  async getAccount(@Param('id') id: string): Promise<WebResponse<Account>> {
    const account = await this.adminService.getAccount(id);
    return { message: 'Success!', data: account };
  }
}
