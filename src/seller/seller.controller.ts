import { Controller, Get, Param } from '@nestjs/common';
import { SellerService } from './seller.service';
import { WebResponse } from 'src/model/web.model';
import { GetSellerDataResponse } from 'src/model/seller.model';
import { AuthUser } from 'src/common/auth.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Account } from '@prisma/client';

@Controller('seller')
@ApiTags('Seller')
export class SellerController {
  constructor(private sellerService: SellerService) {}

  @Get(':sellerId')
  @ApiBearerAuth()
  async getSellerData(
    @AuthUser() account: Account,
    @Param('sellerId')
    sellerId: string,
  ): Promise<WebResponse<GetSellerDataResponse>> {
    const seller = await this.sellerService.getSellerById(sellerId);
    return { message: 'Success', data: seller };
  }
}
