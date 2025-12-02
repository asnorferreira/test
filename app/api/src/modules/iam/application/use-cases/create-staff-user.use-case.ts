import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IIamRepository } from '../ports/i-iam.repository';
import { IHashingService } from '../../domain/services/i-hashing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateStaffUserDto } from '../../presentation/dtos/create-staff-user.dto';
import { User } from '@prisma/client';
import { UserRole } from '@jsp/shared';
import { randomBytes } from 'crypto';
import { AuthEvents } from '../../domain/constants/auth-events.constants';

@Injectable()
export class CreateStaffUserUseCase {
  constructor(
    @Inject(IIamRepository)
    private readonly iamRepository: IIamRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: CreateStaffUserDto,
    actor: { role: UserRole },
  ): Promise<User> {
    if (actor.role === UserRole.GESTOR && dto.role === UserRole.GESTOR) {
      throw new ForbiddenException(
        'Gestores só podem criar usuários com o papel de RH.',
      );
    }
    const existingUser = await this.iamRepository.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const tempPassword = randomBytes(8).toString('hex');
    const passwordHash = await this.hashingService.hash(tempPassword);
    const user = await this.iamRepository.createStaffUser(dto, passwordHash);

    this.eventEmitter.emit(AuthEvents.STAFF_USER_CREATED, {
      email: user.email,
      fullName: user.fullName,
      tempPassword: tempPassword,
    });

    delete (user as any).passwordHash;
    return user;
  }
}