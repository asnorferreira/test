import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@/ts-shared';
import { FastifyReply } from 'fastify';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Widget Snippet')
@ApiBearerAuth()
@Controller('snippet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SnippetController {

  @Get('embed')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Gera o snippet de script para incorporar o widget' })
  @ApiQuery({ name: 'tenantId', description: 'ID do Tenant', required: true })
  @ApiQuery({ name: 'campaignId', description: 'ID da Campanha', required: true })
  getEmbedSnippet(
    @Query('tenantId') tenantId: string,
    @Query('campaignId') campaignId: string,
    @Res() res: FastifyReply
  ) {
    const snippet = `<!-- Intermedius Coach Widget -->
<script 
  id="intermedius-coach-widget"
  src="https://widget.intermedius.com.br/loader.js"
  data-tenant-id="${tenantId}"
  data-campaign-id="${campaignId}"
  async
  defer
></script>
<!-- Fim do Intermedius Coach Widget -->`;

    res.header('Content-Type', 'text/plain').send(snippet);
  }
}
