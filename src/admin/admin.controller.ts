import { Controller, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {}
