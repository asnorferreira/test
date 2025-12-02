import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IStorageService } from './i-storage.service';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IStorageService,
      useClass: SupabaseStorageService,
    },
  ],
  exports: [IStorageService],
})
export class CoreStorageModule {}