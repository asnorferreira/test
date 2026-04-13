import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("System")
@Controller()
export class AppController {
  @Get("health")
  @ApiOperation({
    summary: "Verifica o status de saúde da API (Usado pelo Render)",
  })
  checkHealth() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
