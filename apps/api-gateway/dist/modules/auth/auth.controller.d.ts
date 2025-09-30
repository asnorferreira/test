import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos';
export declare class AuthController {
    private readonly service;
    constructor(service: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
}
