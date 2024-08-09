import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(private adminRepository: AdminRepository) {}
  async getAdminDashboard(account: Account) {
    return await this.adminRepository.getAdminDashboard({ id: account.id });
  }
}
