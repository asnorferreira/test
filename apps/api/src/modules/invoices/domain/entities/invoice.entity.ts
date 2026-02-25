import { Entity } from "@/core/domain/Entity";
import { InvoiceType } from "@maemais/shared-types";

export interface InvoiceProps {
  orderId: string;
  type: InvoiceType;
  amount: number;
  documentUrl: string;
  issuedAt?: Date;
}

export class Invoice extends Entity<InvoiceProps> {
  private constructor(props: InvoiceProps, id?: string) {
    super(props, id);
  }

  static create(props: InvoiceProps, id?: string): Invoice {
    return new Invoice(
      {
        ...props,
        issuedAt: props.issuedAt ?? new Date(),
      },
      id,
    );
  }
}
