import { Test, TestingModule } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { NotificationRepository } from "../../domain/repositories/notification.repository";
import { MailPort } from "@/core/ports/mail.port";
import { NotificationType } from "@maemais/shared-types";

describe("NotificationService", () => {
  let service: NotificationService;
  let repo: jest.Mocked<NotificationRepository>;
  let mailer: jest.Mocked<MailPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: { create: jest.fn(), update: jest.fn() },
        },
        { provide: MailPort, useValue: { sendEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get(NotificationService);
    repo = module.get(NotificationRepository);
    mailer = module.get(MailPort);
  });

  it("deve criar notificação, enviar e-mail e atualizar para SENT", async () => {
    mailer.sendEmail.mockResolvedValue();

    await service.sendEmailNotification(
      "u-1",
      NotificationType.GENERIC,
      "t@t.com",
      "Subj",
      "Body",
    );

    expect(repo.create).toHaveBeenCalled();
    expect(mailer.sendEmail).toHaveBeenCalledWith({
      to: "t@t.com",
      subject: "Subj",
      bodyHtml: "Body",
    });
    expect(repo.update).toHaveBeenCalled();
  });

  it("deve marcar como ERROR se o disparo de e-mail falhar", async () => {
    mailer.sendEmail.mockRejectedValue(new Error("SMTP Error"));

    await service.sendEmailNotification(
      "u-1",
      NotificationType.GENERIC,
      "t@t.com",
      "Subj",
      "Body",
    );

    expect(repo.update).toHaveBeenCalled();
    const updatedNotification = repo.update.mock.calls[0][0];
    expect(updatedNotification.props.status).toBe("ERROR");
  });
});
