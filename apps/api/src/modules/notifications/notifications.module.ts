import { Module } from "@nestjs/common";
import { NotificationRepository } from "./domain/repositories/notification.repository";
import { PrismaNotificationRepository } from "./infra/prisma-notification.repository";
import { NotificationService } from "./application/use-cases/notification.service";
import { GlobalEventsListener } from "./application/listeners/global-events.listener";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [
    NotificationService,
    GlobalEventsListener,
    {
      provide: NotificationRepository,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
