import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Account } from '@prisma/client';
import { AuthCustomer, AuthSeller } from 'src/common/auth.decorator';
import { WebResponse } from 'src/model/web.model';
import { ProductService } from './product.service';
import {
  CreateProductRequest,
  CreateProductResponse,
  FindProductByIdResponse,
  SearchProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from 'src/model/product.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/common/prisma.service';

@Controller('product')
@ApiTags('Product')
export class ProductController {
  constructor(
    private productService: ProductService,
    private prismaService: PrismaService,
  ) {}

  /**
   * Search By Keyword
   */
  // @Get()
  // @ApiBearerAuth()
  // async search(
  //   @AuthCustomer() account: Account,
  //   @Query('search') keyword: string,
  // ): Promise<WebResponse<SearchProductResponse>> {
  //   const result = await this.productService.find(keyword, account);

  //   return { message: 'Success!', data: result };
  // }

  @Post()
  @UseInterceptors(
    FileInterceptor('images', {
      limits: { files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'If you create product by hitting the endpoint manually, you need to substract 7 hour from current time.',
  })
  @ApiBody({
    type: CreateProductRequest,
  })
  @ApiBearerAuth()
  async create(
    @AuthSeller() account: Account,
    @Body() request: CreateProductRequest,
    @UploadedFile() images: Express.Multer.File,
  ): Promise<WebResponse<CreateProductResponse>> {
    if (!images) throw new BadRequestException('Product image is required!');

    const product = await this.productService.createProduct(
      account,
      request,
      images,
    );

    return { message: 'Product created successfully!', data: product };
  }

  @Patch(':productId')
  @UseInterceptors(
    FileInterceptor('images', {
      limits: { files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateProductRequest,
  })
  @ApiBearerAuth()
  async update(
    @AuthSeller() account: Account,
    @Param('productId') productId: string,
    @Body() request: UpdateProductRequest,
    @UploadedFile() images: Express.Multer.File,
  ): Promise<WebResponse<UpdateProductResponse>> {
    const product = await this.productService.updateProduct(
      account,
      productId,
      request,
      images,
    );
    return { message: 'Updated successfully!', data: product };
  }

  @Delete(':productId')
  @ApiBearerAuth()
  async deleteById(
    @AuthSeller() account: Account,
    @Param('productId') productId: string,
  ): Promise<WebResponse> {
    await this.productService.deleteProductById(account, productId);
    return { message: `Successfully delete product with id ${productId}` };
  }

  @Get('nearby')
  @ApiBearerAuth()
  async searchNearby(
    @AuthCustomer() account: Account,
  ): Promise<WebResponse<SearchProductResponse>> {
    const result = await this.productService.findNearby(account);

    return { message: 'Success!', data: result };
  }

  /**
   * Get Product By Id
   */
  @Get(':productId')
  @ApiBearerAuth()
  async getById(
    @AuthCustomer() account: Account,
    @Param('productId') productId: string,
  ): Promise<WebResponse<FindProductByIdResponse>> {
    const result = await this.productService.findById(productId, account);
    return { message: 'Success', data: result };
  }

  /**
   * Reactivate Product
   */
  @Post(':productId/reactivate')
  @ApiBearerAuth()
  async reActivate(
    @AuthSeller() account: Account,
    @Param('productId') productId: string,
  ): Promise<WebResponse> {
    await this.productService.reActivate(account, productId);
    return { message: 'Product reactivated!' };
  }
}
