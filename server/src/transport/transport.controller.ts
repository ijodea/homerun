import { Controller, Get } from '@nestjs/common';
import { TransportService } from './transport.service';
import { ShuttleService } from '../shuttle/shuttle.service';

@Controller('transport')
export class TransportController {
  constructor(
    private readonly transportService: TransportService,
    private readonly shuttleService: ShuttleService,
  ) {}

  @Get('ranked-options')
  async getRankedTransportOptions() {
    try {
      const currentTime = this.shuttleService.getKoreanTime();
      const day = this.shuttleService.getDay();
      const rankedOptions = await this.transportService.getRankedOptions(
        currentTime,
        day,
      );

      return {
        message: 'Top transport options retrieved successfully',
        data: rankedOptions,
      };
    } catch (error) {
      return {
        message: 'Error retrieving top transport options',
        error: error.message,
      };
    }
  }
}
