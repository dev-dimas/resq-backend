import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import { AdminRepository } from './admin.repository';
import { BanAccountRequest, UnbanAccountRequest } from 'src/model/admin.model';
import { ValidationService } from 'src/common/validation.service';
import { AdminValidation } from './admin.validation';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private validatationService: ValidationService,
  ) {}
  async getAdminDashboard(account: Account) {
    return await this.adminRepository.getAdminDashboard({ id: account.id });
  }

  async banAccount(request: BanAccountRequest) {
    const banAccountRequest: BanAccountRequest =
      this.validatationService.validate(AdminValidation.BAN_ACCOUNT, request);

    const isBanAccountExist = await this.adminRepository.getAccount({
      id: banAccountRequest.accountId,
    });

    if (!isBanAccountExist) throw new NotFoundException('Account not found!');
    if (isBanAccountExist.isActive === false)
      throw new ConflictException('Account is already banned!');

    await this.adminRepository.banAccount({
      id: banAccountRequest.accountId,
    });

    await this.adminRepository.solveSameComplaint(banAccountRequest.accountId);
  }

  async unbanAccount(request: UnbanAccountRequest) {
    const unbanAccountRequest: UnbanAccountRequest =
      this.validatationService.validate(AdminValidation.UNBAN_ACCOUNT, request);

    const isBanAccountExist = await this.adminRepository.getAccount({
      id: unbanAccountRequest.accountId,
    });

    if (!isBanAccountExist) throw new NotFoundException('Account not found!');
    if (isBanAccountExist.isActive === true)
      throw new ConflictException('Account is already unbanned!');

    await this.adminRepository.unbanAccount({
      id: unbanAccountRequest.accountId,
    });
  }

  async solveComplaint(complaintId: string): Promise<void> {
    await this.adminRepository.solveComplaint(complaintId);
  }

  async getAccount(id: string): Promise<Account> {
    return await this.adminRepository.getAccount({ id });
  }
}
