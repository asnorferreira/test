import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';

export interface QrCodePayload {
  jti: string;
  sub: string;
  exp: number;
  aud: string[];
}

@Injectable()
export class QrCodeService {

  async generate(
    pessoaId: string,
    pontoAcessoIds: string[] = [],
    expiracaoMinutos: number = 24 * 60,
  ): Promise<{ valor: string; payload: QrCodePayload; imagem: string }> {
    
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiracaoMinutos * 60;
    const jti = randomUUID();

    const payload: QrCodePayload = {
      jti: jti,
      sub: pessoaId,
      exp: exp,
      aud: pontoAcessoIds,
    };

    const valor = jti;
    
    const qrContent = JSON.stringify(payload);

    const imagem = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'M',
      margin: 2,
    });

    return {
      valor,
      payload,
      imagem,
    };
  }
}