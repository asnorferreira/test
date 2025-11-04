import { Pessoa, TipoPessoa } from '@prisma/client';

export class PessoaEntity implements Pessoa {
  id: string;
  nome: string;
  tipo: TipoPessoa;
  unidade: string | null;
  documento: string | null;
  contatos: any | null;
  observacao: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Pessoa>) {
    Object.assign(this, data);
  }

  isVisitante(): boolean {
    return this.tipo === TipoPessoa.VISITANTE;
  }
}