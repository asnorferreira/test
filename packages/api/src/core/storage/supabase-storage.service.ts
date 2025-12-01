import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import {
  FileUpload,
  IStorageService,
  StorageUploadResult,
} from './i-storage.service';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseStorageService implements IStorageService {
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new InternalServerErrorException(
        'Supabase URL ou Service Key não configurados.',
      );
    }
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async upload(
    file: FileUpload,
    bucket: string,
    path: string,
  ): Promise<StorageUploadResult> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Erro no upload para o Supabase:', error);
      throw new InternalServerErrorException(
        'Falha ao fazer upload do arquivo.',
      );
    }

    const { data: publicUrlData } = this.client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
    };
  }

  /**
   * Implementação do download
   */
  async downloadFileStream(storagePath: string): Promise<Readable> {
    const url = new URL(storagePath);
    const pathSegments = url.pathname.split('/');
    const bucketName = pathSegments[4];
    const filePath = pathSegments.slice(5).join('/');

    if (!bucketName || !filePath) {
      throw new InternalServerErrorException(
        `URL de storage inválida: ${storagePath}`,
      );
    }

    const { data, error } = await this.client.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Erro ao baixar arquivo do Supabase:', error);
      throw new InternalServerErrorException(
        `Falha ao baixar o arquivo: ${filePath}`,
      );
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return Readable.from(buffer);
  }
}