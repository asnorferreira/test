import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

import { validateEnv } from "./config/env.config";
import { CONSTANTS } from "@maemais/shared-types";

import { InfraModule } from "./infra/infra.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { QuestionnairesModule } from "./modules/questionnaires/questionnaires.module";
import { MedicalCasesModule } from "./modules/medical-cases/medical-cases.module";
import { PrescriptionsModule } from "./modules/prescriptions/prescriptions.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
    EventEmitterModule.forRoot({
      global: true,
      wildcard: false,
      delimiter: ".",
    }),
    ThrottlerModule.forRoot([
      {
        ttl: CONSTANTS.RATE_LIMIT_TTL,
        limit: CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
      },
    ]),
    InfraModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    QuestionnairesModule,
    MedicalCasesModule,
    PrescriptionsModule,
    OrdersModule,
    InvoicesModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
