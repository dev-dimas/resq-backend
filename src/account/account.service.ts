import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AccountValidation } from 'src/account/account.validation';
import { ImageService } from 'src/common/image.service';
import { ValidationService } from 'src/common/validation.service';
import {
  ChangePasswordRequest,
  EditProfileRequest,
  EditProfileResponse,
  LoginAccountRequest,
  LoginAccountResponse,
  RegisterAccountRequest,
  RegisterAccountResponse,
  SetNotificationRequest,
  UpdateLocationRequest,
  UpdateLocationResponse,
} from 'src/model/account.model';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
import { AccountRepository } from './account.repository';

@Injectable()
export class AccountService {
  constructor(
    private validationService: ValidationService,
    private imageService: ImageService,
    private accountRepository: AccountRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(
    request: RegisterAccountRequest,
  ): Promise<RegisterAccountResponse> {
    const registerRequest: RegisterAccountRequest =
      this.validationService.validate(AccountValidation.REGISTER, request);

    const isAccountExist = await this.accountRepository.isAccountExist({
      email: registerRequest.email,
    });

    if (isAccountExist != 0) {
      throw new ConflictException('Email already used!');
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    if (registerRequest.asCustomer) {
      await this.accountRepository.createAccountCustomer(registerRequest);
    } else {
      await this.accountRepository.createAccountSeller(registerRequest);
    }

    return {
      email: registerRequest.email,
      name: registerRequest.name,
      type: registerRequest.asCustomer ? 'customer' : 'seller',
    };
  }

  async login(request: LoginAccountRequest): Promise<LoginAccountResponse> {
    const loginRequest: LoginAccountRequest = this.validationService.validate(
      AccountValidation.LOGIN,
      request,
    );

    const account = await this.accountRepository.findByEmail({
      email: request.email,
    });

    if (!account) throw new ForbiddenException('Invalid credentials!');

    const isPasswordMatch = await bcrypt.compare(
      loginRequest.password,
      account.password,
    );

    if (!isPasswordMatch) throw new ForbiddenException('Invalid credentials!');

    const loginToken = uuid();

    await this.accountRepository.setToken({
      email: request.email,
      token: loginToken,
    });

    return {
      token: loginToken,
      isSeller: account.isSeller,
    };
  }

  async editProfile(
    request: EditProfileRequest,
    account: Account,
  ): Promise<EditProfileResponse> {
    const editProfileRequest: EditProfileRequest =
      this.validationService.validate(AccountValidation.EDIT_PROFILE, request);

    const updatedProfile = await this.accountRepository.updateAccount({
      id: account.id,
      email: editProfileRequest.email,
      name: editProfileRequest.name,
    });

    return { email: updatedProfile.email, name: updatedProfile.name };
  }

  async updateNotificationToken(
    request: SetNotificationRequest,
    account: Account,
  ): Promise<void> {
    const setNotificationRequest: SetNotificationRequest =
      this.validationService.validate(
        AccountValidation.UPDATE_NOTIFICATION_TOKEN,
        request,
      );

    await this.accountRepository.updateNotificationToken({
      id: account.id,
      token: setNotificationRequest.token,
    });
  }

  async editAvatar(
    account: Account,
    avatar: Express.Multer.File,
  ): Promise<void> {
    await this.deleteAvatarFromStorage(account);

    const filename = await this.imageService.saveTo('avatar', avatar);
    const blurHash = await this.imageService.generateBlurhash(avatar);

    await this.accountRepository.updateAccountAvatar({
      id: account.id,
      path: filename,
      blurHash,
    });
  }

  async deleteAvatar(account: Account): Promise<void> {
    await this.deleteAvatarFromStorage(account);

    await this.accountRepository.updateAccountAvatar({
      id: account.id,
      path: null,
      blurHash: null,
    });
  }

  private async deleteAvatarFromStorage(account: Account) {
    if (account.avatar) {
      await this.imageService.removeFile(account.avatar);
    }
  }

  async changePassword(
    request: ChangePasswordRequest,
    account: Account,
  ): Promise<void> {
    const changePasswordRequest: ChangePasswordRequest =
      this.validationService.validate(
        AccountValidation.CHANGE_PASSWORD,
        request,
      );

    const isOldPasswordMatch: boolean = await bcrypt.compare(
      changePasswordRequest.currentPassword,
      account.password,
    );

    if (!isOldPasswordMatch)
      throw new ForbiddenException('The current password does not match!');

    changePasswordRequest.newPassword = await bcrypt.hash(
      changePasswordRequest.newPassword,
      10,
    );

    await this.accountRepository.updateAccountPassword({
      id: account.id,
      password: changePasswordRequest.newPassword,
    });
  }

  async updateLocation(
    request: UpdateLocationRequest,
    account: Account,
  ): Promise<UpdateLocationResponse> {
    const updateLocationRequest: UpdateLocationRequest =
      this.validationService.validate(
        AccountValidation.UPDATE_LOCATION,
        request,
      );

    return await this.accountRepository.updateAccountLocation({
      account: account,
      latitude: `${updateLocationRequest.latitude}`,
      longitude: `${updateLocationRequest.longitude}`,
      address: updateLocationRequest.address,
    });
  }

  async logout(account: Account): Promise<void> {
    await this.accountRepository.deleteToken({ id: account.id });
  }
}
