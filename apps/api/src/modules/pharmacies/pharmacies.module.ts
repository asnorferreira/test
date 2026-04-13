import { Module } from "@nestjs/common";
import { PharmacyService } from "./application/use-cases/pharmacy.service";
import { PharmaciesController } from "./presentation/pharmacies.controller";

@Module({
  controllers: [PharmaciesController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmaciesModule {}
