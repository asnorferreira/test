export interface ViaCepAddress {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export abstract class ViaCepPort {
  abstract lookup(zipCode: string): Promise<ViaCepAddress>;
}
