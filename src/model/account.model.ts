import { ApiProperty } from '@nestjs/swagger';

export class RegisterAccountRequest {
  email: string;
  name: string;
  password: string;
  asCustomer: boolean;
}

export class RegisterAccountResponse {
  email: string;
  name: string;
  type: 'customer' | 'seller';
}

export class LoginAccountRequest {
  email: string;
  password: string;
}

export class LoginAccountResponse {
  token: string;
}

export class EditProfileRequest {
  email: string;
  name: string;
}

export class EditProfileResponse {
  email: string;
  name: string;
}

export class EditAvatarRequest {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any;
}

export class ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
