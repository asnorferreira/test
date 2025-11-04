import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EdgeConfigService {
  constructor(private configService: ConfigService) {}

  getEdgeDbUrl(): string {
    return this.configService.get<string>('EDGE_DATABASE_URL')!;
  }
  getEdgePort(): number {
    return this.configService.get<number>('EDGE_PORT')!;
  }
  getBackendUrl(): string {
    return this.configService.get<string>('EDGE_SYNC_BACKEND_URL')!;
  }
  getLocalApiKey(): string {
    return this.configService.get<string>('EDGE_API_KEY')!;
  }
  getSyncInterval(): number {
    return this.configService.get<number>('EDGE_SYNC_INTERVAL_MS')!;
  }
  getNodeEnv(): string {
    return this.configService.get<string>('NODE_ENV')!;
  }
}