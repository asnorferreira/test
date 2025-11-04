import { Injectable, Inject, ConflictException } from '@nestjs/common';
import {
  IPessoaRepository,
  PessoaCreateInput,
} from '@app/domain';
import { Pessoa } from '@prisma/client';

@Injectable()
export class CreatePessoaUseCase {
  constructor(
    @Inject(IPessoaRepository)
    private readonly pessoaRepository: IPessoaRepository,
  ) {}

  async execute(data: PessoaCreateInput): Promise<Pessoa> {
    if (data.documento) {
      const existente = await this.pessoaRepository.findByDocumento(
        data.documento,
      );
      if (existente) {
        throw new ConflictException('Já existe uma pessoa com este documento.');
      }
    }

    // TODO: Adicionar lógica de auditoria (via MessageBus ou Interceptor)
    
    return this.pessoaRepository.create(data);
  }
}