import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user) {
      return user;
    } else {
      throw new UnauthorizedException('You need to login first!');
    }
  },
);

export const AuthCustomer = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException('You need to login first!');

    if (!user.isSeller) {
      return user;
    } else {
      throw new UnauthorizedException(
        'Only customer can access this endpoint!',
      );
    }
  },
);

export const AuthSeller = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException('You need to login first!');

    if (user.isSeller) {
      return user;
    } else {
      throw new UnauthorizedException('Only seller can access this endpoint!');
    }
  },
);
