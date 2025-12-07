import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SpacexService } from './spacex.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('spacex (opcional)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('spacex')
export class SpacexController {
  constructor(private readonly spacexService: SpacexService) {}

  @Get('launches')
  @ApiOperation({ summary: 'Lista lançamentos da SpaceX (Paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(
    @Query('page') page?: number, 
    @Query('limit') limit?: number
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 10;
    return this.spacexService.findAll(p, l);
  }

  @Get('launches/:id')
  @ApiOperation({ summary: 'Detalhes de um lançamento específico' })
  findOne(@Param('id') id: string) {
    return this.spacexService.findOne(id);
  }
}