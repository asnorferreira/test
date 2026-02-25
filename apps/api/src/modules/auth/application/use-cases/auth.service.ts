import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EventEmitter2 } from "@nestjs/event-emitter";
import * as bcrypt from "bcryptjs";
import { UserRepository } from "@/modules/users/domain/repositories/user.repository";
import { User } from "@/modules/users/domain/entities/user.entity";
import { LoginDto } from "../dtos/login.dto";
import { RegisterDto } from "../dtos/register.dto";
import { UserRole, CONSTANTS } from "@maemais/shared-types";
import { UserRegisteredEvent } from "../../domain/events/user-registered.event";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (!user) throw new UnauthorizedException("Credenciais inválidas.");

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.props.passwordHash,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException("Credenciais inválidas.");

    this.logger.log(`Usuário logado: ${user.props.email}`);

    const payload = {
      sub: user.id,
      email: user.props.email,
      role: user.props.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.props.name,
        email: user.props.email,
        role: user.props.role,
      },
    };
  }

  async registerPatient(dto: RegisterDto) {
    const emailLower = dto.email.toLowerCase();
    const existingUser = await this.userRepository.findByEmail(emailLower);

    if (existingUser)
      throw new ConflictException("Este e-mail já está em uso.");

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const newUser = User.create({
      name: dto.name,
      email: emailLower,
      passwordHash,
      phone: dto.phone,
      cpf: dto.cpf,
      role: UserRole.PATIENT,
    });

    await this.userRepository.create(newUser);

    this.eventEmitter.emit(
      CONSTANTS.EVENTS.USER_REGISTERED,
      new UserRegisteredEvent(
        newUser.id,
        newUser.props.email,
        newUser.props.name,
      ),
    );

    const payload = {
      sub: newUser.id,
      email: newUser.props.email,
      role: newUser.props.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        name: newUser.props.name,
        email: newUser.props.email,
        role: newUser.props.role,
      },
    };
  }
}
