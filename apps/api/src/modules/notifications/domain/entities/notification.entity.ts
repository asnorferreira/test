import { Entity } from "@/core/domain/Entity";
import { NotificationType } from "@maemais/shared-types";

export interface NotificationProps {
  userId?: string | null;
  type: NotificationType;
  channel: string;
  payload: Record<string, any>;
  status: "PENDING" | "SENT" | "ERROR";
  createdAt?: Date;
  sentAt?: Date | null;
}

export class Notification extends Entity<NotificationProps> {
  private constructor(props: NotificationProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<NotificationProps, "status" | "createdAt" | "sentAt"> & {
      status?: NotificationProps["status"];
      createdAt?: Date;
      sentAt?: Date | null;
    },
    id?: string,
  ): Notification {
    return new Notification(
      {
        ...props,
        status: props.status ?? "PENDING",
        createdAt: props.createdAt ?? new Date(),
        sentAt: props.sentAt ?? null,
      },
      id,
    );
  }

  markAsSent() {
    this.props.status = "SENT";
    this.props.sentAt = new Date();
  }

  markAsError() {
    this.props.status = "ERROR";
  }
}
