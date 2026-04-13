import { Module } from "@nestjs/common";
import { ShippingService } from "./application/use-cases/shipping.service";
import { ShippingController } from "./presentation/shipping.controller";
import { ViaCepPort } from "./domain/viacep.port";
import { ViaCepClient } from "./infra/viacep.client";

@Module({
  controllers: [ShippingController],
  providers: [
    ShippingService,
    {
      provide: ViaCepPort,
      useClass: ViaCepClient,
    },
  ],
  exports: [ShippingService],
})
export class ShippingModule {}
