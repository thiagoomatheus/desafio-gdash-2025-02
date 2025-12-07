import { Module } from '@nestjs/common';
import { SpacexService } from './spacex.service';
import { SpacexController } from './spacex.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SpacexController],
  providers: [SpacexService],
})
export class SpacexModule {}