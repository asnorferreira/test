import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { QuestionnaireService } from "./questionnaire.service";
import { QuestionnaireRepository } from "../../domain/repositories/questionnaire.repository";
import { PreAnalysisStatus } from "@maemais/shared-types";

describe("QuestionnaireService", () => {
  let service: QuestionnaireService;
  let repo: jest.Mocked<QuestionnaireRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnaireService,
        {
          provide: QuestionnaireRepository,
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestionnaireService>(QuestionnaireService);
    repo = module.get(QuestionnaireRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it("deve submeter questionário, avaliar como APTA e emitir o evento", async () => {
    const dto = {
      answers: [{ questionKey: "sintoma", answerValue: "tudo bem" }],
    };

    const result = await service.submit("user-1", dto);

    expect(repo.create).toHaveBeenCalled();
    expect(result.preAnalysisStatus).toBe(PreAnalysisStatus.APTA);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      "questionnaire.submitted",
      expect.objectContaining({
        questionnaireId: expect.any(String),
        userId: "user-1",
        preAnalysisStatus: PreAnalysisStatus.APTA,
      }),
    );
  });
});
