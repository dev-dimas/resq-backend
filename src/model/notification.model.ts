export class NotificationRequest {
  to: string[];
  title: string;
  body: string;
  url?: string;
  pushKey: string;
}
