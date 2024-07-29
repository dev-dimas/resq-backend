import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidationService } from 'src/common/validation.service';
import { NotificationValidation } from './notification.validation';
import { NotificationRequest } from 'src/model/notification.model';
import { NotificationService as ExpoNotificationService } from 'src/common/notification.service';

@Injectable()
export class NotificationService {
  constructor(
    private expoNotification: ExpoNotificationService,
    private validationService: ValidationService,
  ) {}

  async send(request: NotificationRequest) {
    const sendRequest: NotificationRequest =
      await this.validationService.validate(
        NotificationValidation.SEND,
        request,
      );

    if (sendRequest.pushKey !== process.env.EXPO_ACCESS_TOKEN)
      throw new UnauthorizedException('Unauthorized!');

    await this.expoNotification.sendNotification(sendRequest.to, {
      title: sendRequest.title,
      body: sendRequest.body,
      url: sendRequest.url,
    });
  }
}
