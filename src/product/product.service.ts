import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ImageService } from 'src/common/image.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateProductRequest,
  CreateProductResponse,
  FindProductByIdResponse,
  SearchProductResponse,
  UpdateProductRequest,
} from 'src/model/product.model';
import { HaversineService } from 'src/utils/haversine/haversine.service';
import { Logger } from 'winston';
import { ProductValidation } from './product.validation';
import { ProductRepository } from './product.repository';
import { CustomerRepository } from 'src/customer/customer.repository';
import { PrismaService } from 'src/common/prisma.service';
import { NotificationService } from 'src/common/notification.service';
import { SellerRepository } from 'src/seller/seller.repository';

@Injectable()
export class ProductService {
  constructor(
    private validationService: ValidationService,
    private haversineService: HaversineService,
    private prismaService: PrismaService,
    private productRepository: ProductRepository,
    private sellerRepository: SellerRepository,
    private customerRepository: CustomerRepository,
    private imageService: ImageService,
    private notificationService: NotificationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async find(
    keyword: string,
    account: Account,
  ): Promise<SearchProductResponse> {
    const allProducts = await this.productRepository.findByKeyword({
      keyword,
    });

    const customer = await this.customerRepository.getCustomer({
      id: account.id,
    });

    if (!allProducts) {
      return {
        customer,
        products: [],
      };
    }

    return {
      customer,
      products: allProducts
        .map((product) => {
          const distance = this.haversineService.calculateDistance(
            customer.latitude,
            customer.longitude,
            product.seller.latitude,
            product.seller.longitude,
          );

          return { ...product, distance };
        })
        .filter((product) => {
          let isAvailable = false;

          const startDate = dayjs(product.startTime);
          const endDate = dayjs(product.endTime);
          const startTimeSell = dayjs(
            product.isDaily ? undefined : product.startTime,
          )
            .hour(startDate.hour())
            .minute(startDate.minute());
          const endTimeSell = dayjs(
            product.isDaily ? undefined : product.startTime,
          )
            .hour(endDate.hour())
            .minute(endDate.minute());
          const now = dayjs();

          if (now.isAfter(startTimeSell) && now.isBefore(endTimeSell))
            isAvailable = true;

          return product.distance <= 1.1 && isAvailable;
        }),
    };
  }

  async createProduct(
    account: Account,
    request: CreateProductRequest,
    images: Express.Multer.File,
  ): Promise<CreateProductResponse> {
    const createProductRequest: CreateProductRequest =
      this.validationService.validate(ProductValidation.CREATE, request);

    const product = await this.prismaService.$transaction(async (prisma) => {
      const filename = await this.imageService.saveTo('product', images);
      const blurHash = await this.imageService.generateBlurhash(images);

      const now = dayjs();
      const startTimeRequest = dayjs(createProductRequest.startTime);
      const endTimeRequest = dayjs(createProductRequest.endTime);

      const startTime = now
        .hour(startTimeRequest.hour())
        .minute(startTimeRequest.minute())
        .second(0);

      let endTime = now
        .hour(endTimeRequest.hour())
        .minute(endTimeRequest.minute())
        .second(0);

      if (startTime.isAfter(endTime)) {
        endTime = endTime.add(1, 'day');
      }

      createProductRequest.startTime = startTime.format();
      createProductRequest.endTime = endTime.format();

      const product = await this.productRepository.createProduct({
        prisma,
        productData: createProductRequest,
        imagePath: filename,
        account,
        blurHash,
      });

      if (now.isAfter(startTime) && now.isBefore(endTime)) {
        const result = await this.sellerRepository.getSubscribers({
          id: account.id,
        });

        if (!result) return;

        const subscribers = result.flatMap((item) =>
          item.subscriber.map((sub) => sub.customerId),
        );

        await this.notificationService.sendNotification(subscribers, {
          title: account.name,
          body: `Produk baru!. Cobain ${product.name} yuk di toko kami 😍.`,
          url: '/produk/' + product.id,
        });

        return product;
      }
    });

    return { product };
  }

  async updateProduct(
    account: Account,
    productId: string,
    request: UpdateProductRequest,
    images: Express.Multer.File,
  ): Promise<CreateProductResponse> {
    const updateProductRequest: UpdateProductRequest =
      this.validationService.validate(ProductValidation.UPDATE, request);

    if (!Object.keys(updateProductRequest).length && !images) {
      throw new BadRequestException(
        'At least one field is required to update the product!',
      );
    }

    const existingProduct = await this.productRepository.getById({
      id: productId,
    });

    if (!existingProduct) throw new NotFoundException('Product not found!');

    if (existingProduct.sellerId !== account.id)
      throw new ForbiddenException('This product is not yours!');

    const product = await this.prismaService.$transaction(async (prisma) => {
      let filename = undefined;
      let blurHash = undefined;

      if (images) {
        filename = await this.imageService.saveTo('product', images);
        await this.imageService.removeFile(existingProduct.images[0]);
        blurHash = await this.imageService.generateBlurhash(images);
      }

      const now = dayjs(
        updateProductRequest.isDaily ? undefined : existingProduct.startTime,
      );
      const startTimeRequest = dayjs(updateProductRequest.startTime);
      const endTimeRequest = dayjs(updateProductRequest.endTime);

      const startTime = now
        .hour(startTimeRequest.hour())
        .minute(startTimeRequest.minute())
        .second(0);

      let endTime = now
        .hour(endTimeRequest.hour())
        .minute(endTimeRequest.minute())
        .second(0);

      if (startTime.isAfter(endTime)) {
        endTime = endTime.add(1, 'day');
      }

      updateProductRequest.startTime = startTime.format();
      updateProductRequest.endTime = endTime.format();

      return await this.productRepository.updateProduct({
        prisma,
        productData: updateProductRequest,
        productId,
        imagePath: filename,
        blurHash,
        account,
      });
    });

    return { product };
  }

  async deleteProductById(account: Account, productId: string): Promise<void> {
    const product = await this.productRepository.getById({ id: productId });

    if (!product) throw new NotFoundException('Product not found!');
    if (product.sellerId !== account.id)
      throw new ForbiddenException('This product is not yours!');

    await this.productRepository.deleteProduct({
      id: productId,
      sellerId: account.id,
    });

    await this.imageService.removeFile(product.images[0]);
  }

  async findNearby(account: Account): Promise<SearchProductResponse> {
    const allProducts = await this.productRepository.getAll();

    const customer = await this.customerRepository.getCustomer({
      id: account.id,
    });

    if (!allProducts) {
      return {
        customer,
        products: [],
      };
    }

    return {
      customer,
      products: allProducts
        .map((product) => {
          const distance = this.haversineService.calculateDistance(
            customer.latitude,
            customer.longitude,
            product.seller.latitude,
            product.seller.longitude,
          );

          return { ...product, distance };
        })
        .filter((product) => {
          let isAvailable = false;

          const startDate = dayjs(product.startTime);
          const endDate = dayjs(product.endTime);
          const startTimeSell = dayjs(
            product.isDaily ? undefined : product.startTime,
          )
            .hour(startDate.hour())
            .minute(startDate.minute());
          const endTimeSell = dayjs(
            product.isDaily ? undefined : product.startTime,
          )
            .hour(endDate.hour())
            .minute(endDate.minute());
          const now = dayjs();

          if (now.isAfter(startTimeSell) && now.isBefore(endTimeSell))
            isAvailable = true;

          return product.distance <= 1.1 && isAvailable;
        }),
    };
  }

  async findById(
    productId: string,
    account: Account,
  ): Promise<FindProductByIdResponse> {
    const product = await this.productRepository.getByIdWithSeller({
      id: productId,
    });

    if (!product) throw new NotFoundException('Product not found!');

    const customer = await this.customerRepository.getCustomer({
      id: account.id,
    });

    const distance = this.haversineService.calculateDistance(
      customer.latitude,
      customer.longitude,
      product.seller.latitude,
      product.seller.longitude,
    );

    return {
      product: {
        ...product,
        seller: {
          ...product.seller,
          subscriber: product.seller.subscriber.length,
        },
        distance,
      },
    };
  }

  async reActivate(account: Account, productId: string): Promise<any> {
    const existingProduct = await this.productRepository.getById({
      id: productId,
    });

    if (!existingProduct) throw new NotFoundException('Product not found!');

    if (existingProduct.sellerId !== account.id)
      throw new ForbiddenException('This product is not yours!');

    const existingStartTime = dayjs(existingProduct.startTime);
    const existingEndTime = dayjs(existingProduct.endTime);
    const now = dayjs();

    if (now.isAfter(existingEndTime)) return;

    const newStartTime = now
      .hour(existingStartTime.hour())
      .minute(existingStartTime.minute())
      .second(0)
      .toDate();
    const newEndTime = now
      .hour(existingEndTime.hour())
      .minute(existingEndTime.minute())
      .second(0)
      .toDate();

    await this.productRepository.changeTimeSell({
      id: productId,
      sellerId: account.id,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  }
}
