import { NegotiationRule } from '@prisma/client';

export interface Action {
  type: 'PROPOSE_DISCOUNT' | 'PROPOSE_INSTALLMENTS';
  value: number;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export class RulesEngine {
  private rules: NegotiationRule[];

  constructor(rules: NegotiationRule[]) {
    this.rules = rules;
  }

  public validate(action: Action): ValidationResult {
    const rule = this.rules[0];
    if (!rule) {
      return { isValid: true };
    }

    switch (action.type) {
      case 'PROPOSE_DISCOUNT':
        if (rule.maxDiscountPercentage !== null && action.value > rule.maxDiscountPercentage) {
          return {
            isValid: false,
            reason: `Desconto de ${action.value}% excede o limite de ${rule.maxDiscountPercentage}%.`,
          };
        }
        break;

      case 'PROPOSE_INSTALLMENTS':
        if (rule.maxInstallments !== null && action.value > rule.maxInstallments) {
          return {
            isValid: false,
            reason: `Parcelamento de ${action.value}x excede o limite de ${rule.maxInstallments}x.`,
          };
        }
        break;
    }

    return { isValid: true };
  }
}