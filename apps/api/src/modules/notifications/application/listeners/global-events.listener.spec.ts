import { Test, TestingModule } from "@nestjs/testing";
import { GlobalEventsListener } from "./global-events.listener";
import { NotificationService } from "../use-cases/notification.service";
import { UserRepository } from "@/modules/users/domain/repositories/user.repository";
import { MedicalReviewStatus } from "@maemais/shared-types";

describe("GlobalEventsListener", () => {
  let listener: GlobalEventsListener;
  let notificationService: jest.Mocked<NotificationService>;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalEventsListener,
        {
          provide: NotificationService,
          useValue: { sendEmailNotification: jest.fn() },
        },
        { provide: UserRepository, useValue: { findById: jest.fn() } },
      ],
    }).compile();

    listener = module.get(GlobalEventsListener);
    notificationService = module.get(NotificationService);
    userRepo = module.get(UserRepository);
  });

  it("deve enviar email de aprovação quando caso médico for aprovado", async () => {
    userRepo.findById.mockResolvedValue({
      id: "u-1",
      props: { name: "João", email: "j@j.com" },
    } as any);

    await listener.handleMedicalCaseReviewed({
      userId: "u-1",
      status: MedicalReviewStatus.APPROVED_BY_MEDICAL,
    });

    expect(notificationService.sendEmailNotification).toHaveBeenCalledWith(
      "u-1",
      expect.any(String),
      "j@j.com",
      expect.stringContaining("Aprovado"),
      expect.any(String),
      expect.any(Object),
    );
  });
});
