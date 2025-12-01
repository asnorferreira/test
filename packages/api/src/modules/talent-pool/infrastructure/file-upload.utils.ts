import { BadRequestException } from '@nestjs/common';

export const cvFileLimits = {
  fileSize: 1024 * 1024 * 5, // 5MB
};

export const cvFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(/\.(pdf|doc|docx)$/i)) {
    return callback(
      new BadRequestException(
        'Formato de arquivo inválido. Apenas PDF, DOC ou DOCX são permitidos.',
      ),
      false,
    );
  }
  callback(null, true);
};

export const cvFileFilterRegex = /\.(pdf|doc|docx)$/i;