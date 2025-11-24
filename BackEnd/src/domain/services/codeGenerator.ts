// src/domain/services/codeGenerator.ts

import * as crypto from 'crypto';

/**
 * Gera um código de afiliação único, alfanumérico e em letras maiúsculas.
 * @param userId O ID do usuário para garantir que cada usuário tenha uma base de código única.
 * @returns Uma string de código de afiliação (ex: "AFIL-G2H4J6K8")
 */
export function generateAffiliateCode(userId: string): string {

    const baseHash = crypto.createHash('sha256').update(userId).digest('hex');

    const uniquePart = baseHash.substring(0, 8).toUpperCase();

    const cleanPart = uniquePart.replace(/[^A-Z0-9]/g, 'X');

    return `AFIL-${cleanPart}`;
}