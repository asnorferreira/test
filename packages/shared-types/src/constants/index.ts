export const CONSTANTS = {
  SLA_MEDICAL_REVIEW_MINUTES: 30,
  DEFAULT_SHIPPING_FEE_CENTS: 2500,
  CURRENCY: "BRL",

  PAGINATION_DEFAULT_LIMIT: 20,
  RATE_LIMIT_TTL: 60000,
  RATE_LIMIT_MAX_REQUESTS: 100,

  EVENTS: {
    USER_REGISTERED: "user.registered",
    QUESTIONNAIRE_SUBMITTED: "questionnaire.submitted",
    MEDICAL_CASE_REVIEWED: "medical_case.reviewed",
    PRODUCT_UPDATED: "product.updated",
    ORDER_CREATED: "order.created",
    ORDER_PAID: "order.paid",
    PAYMENT_FAILED: "payment.failed",
  },
} as const;
