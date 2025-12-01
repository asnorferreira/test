import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IIamRepository } from '../ports/i-iam.repository';
import { RegisterCandidateDto } from '../../presentation/dtos/register-candidate.dto';
import { IHashingService } from '../../domain/services/i-hashing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthEvents } from '../../domain/constants/auth-events.constants';

@Injectable()
export class RegisterCandidateUseCase {
  constructor(
    @Inject(IIamRepository)
    private readonly iamRepository: IIamRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: RegisterCandidateDto): Promise<{ message: string }> {
    const existingUser = await this.iamRepository.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const passwordHash = await this.hashingService.hash(dto.password);
    const user = await this.iamRepository.registerCandidate(dto, passwordHash);

    await this.iamRepository.createVerificationToken(user.email);

    this.eventEmitter.emit(AuthEvents.USER_REGISTERED, {
      email: user.email,
      fullName: user.fullName,
    });

    return {
      message: 'Cadastro realizado. Verifique seu e-mail para ativar a conta.',
    };
  }
}