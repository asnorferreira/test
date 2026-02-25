import { Injectable } from "@nestjs/common";
import { NotificationRepository } from "../domain/repositories/notification.repository";
import { Notification } from "../domain/entities/notification.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { NotificationType } from "@maemais/shared-types";

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(notification: Notification): Promise<void> {
    await this.prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.props.userId,
        type: notification.props.type,
        channel: notification.props.channel,
        payload: notification.props.payload,
        status: notification.props.status,
      },
    });
  }

  async update(notification: Notification): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: notification.props.status,
        sentAt: notification.props.sentAt,
      },
    });
  }
}
