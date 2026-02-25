import { Injectable, Logger } from "@nestjs/common";
import { StoragePort } from "@/core/ports/storage.port";
import { ConfigService } from "@nestjs/config";
import { Env } from "@/config/env.config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseStorageAdapter implements StoragePort {
  private supabase: SupabaseClient;
  private bucketName: string;
  private readonly logger = new Logger(SupabaseStorageAdapter.name);

  constructor(private configService: ConfigService<Env, true>) {
    const supabaseUrl = this.configService.get("SUPABASE_URL", { infer: true });
    const supabaseKey = this.configService.get("SUPABASE_SERVICE_ROLE_KEY", {
      infer: true,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName =
      this.configService.get("SUPABASE_BUCKET_NAME", { infer: true }) ||
      "maemais-documents";
  }

  async uploadPdf(fileName: string, fileBuffer: Buffer): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, fileBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (error) throw error;

      this.logger.log(`Arquivo salvo no Supabase: ${data.path}`);
      return data.path;
    } catch (error) {
      this.logger.error(`Erro ao fazer upload do arquivo ${fileName}`, error);
      throw new Error("Falha ao processar armazenamento do documento.");
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
