import { Inject, Injectable } from '@nestjs/common';
import Expo, {
  ExpoPushErrorTicket,
  ExpoPushMessage,
  ExpoPushReceipt,
  ExpoPushToken,
} from 'expo-server-sdk';
import { PrismaService } from './prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class NotificationService {
  private readonly expo: Expo;

  constructor(
    private prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
      useFcmV1: true,
    });
  }

  async sendNotification(
    tokens: ExpoPushToken[],
    data: { title: string; body: string; url?: string },
  ) {
    const messages: ExpoPushMessage[] = [];

    for (const pushToken of tokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: data.title,
        body: data.body,
        data: { url: data.url || '' },
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (e) {
        const error = e as ExpoPushErrorTicket;
        if (!error.details && !error.details.error) return;

        let token: string;
        const tokenMatch = error.message.match(/"ExponentPushToken\[[^\]]+\]"/);
        if (tokenMatch) token = tokenMatch[0];

        if (error.details.error === 'DeviceNotRegistered') {
          if (!token) return;
          await this.prisma.account.updateMany({
            where: {
              expoPushToken: token,
            },
            data: {
              expoPushToken: null,
            },
          });
        } else {
          this.logger.error(error.message);
        }
      }
    }

    const receiptIds = [];
    for (const ticket of tickets) {
      if (ticket.status === 'ok') {
        receiptIds.push(ticket.id);
      }
    }

    const receiptIdChunks =
      this.expo.chunkPushNotificationReceiptIds(receiptIds);
    for (const chunk of receiptIdChunks) {
      try {
        const receipts =
          await this.expo.getPushNotificationReceiptsAsync(chunk);

        for (const receiptId in receipts) {
          const { status, message, details } = receipts[
            receiptId
          ] as ExpoPushReceipt & { message: string };

          if (status === 'error') {
            let token: string | undefined;
            const tokenMatch =
              message.match(/"ExponentPushToken\[[^\]]+\]"/) || undefined;
            if (tokenMatch) token = tokenMatch[0];
            console.error(
              `There was an error sending a notification: ${message}`,
            );

            if (details.error === 'DeviceNotRegistered') {
              if (!token) return;
              await this.prisma.account.updateMany({
                where: {
                  expoPushToken: token,
                },
                data: {
                  expoPushToken: null,
                },
              });
            } else {
              this.logger.error(message);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
