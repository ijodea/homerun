import { Controller, Get, Query } from '@nestjs/common';
import { TransportService } from './transport.service';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('ranked-options')
  async getRankedTransportOptions(
    @Query('day') day: string,
  ) {
    try {
      const currentTime = new Date();
      const rankedOptions = await this.transportService.getRankedOptions(currentTime, day);

      return {
        message: 'Top transport options retrieved successfully',
        data: rankedOptions,
      };
    } catch (error) {
      return {
        message: 'Error retrieving transport options',
        error: error.message,
      };
    }
  }
}
