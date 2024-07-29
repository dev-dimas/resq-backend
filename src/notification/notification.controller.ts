import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { NotificationRequest } from 'src/model/notification.model';
import { WebResponse } from 'src/model/web.model';
import { NotificationService } from './notification.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('notification')
@ApiTags('Notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post()
  @HttpCode(200)
  async send(@Body() request: NotificationRequest): Promise<WebResponse> {
    await this.notificationService.send(request);

    return { message: 'Notification sent successfully!' };
  }
}
