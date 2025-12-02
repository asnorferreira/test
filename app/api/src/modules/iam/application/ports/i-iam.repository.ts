import { User } from '@prisma/client';
import { RegisterCandidateDto } from '../../presentation/dtos/register-candidate.dto';
import { CreateStaffUserDto } from '../../presentation/dtos/create-staff-user.dto';
import { UserRole } from '@jsp/shared';

export abstract class IIamRepository {
  abstract findUserByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findUsersByRole(
    roles: UserRole[],
  ): Promise<Pick<User, 'email' | 'fullName'>[]>;
  abstract registerCandidate(
    dto: RegisterCandidateDto,
    passwordHash: string,
  ): Promise<User>;
  abstract createStaffUser(
    dto: CreateStaffUserDto,
    passwordHash: string,
  ): Promise<User>;
  abstract createVerificationToken(email: string): Promise<string>;
}