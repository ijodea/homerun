import { Controller, Post, Body } from '@nestjs/common';
import { TaxiService } from './taxi.service';

@Controller('taxi')
export class TaxiController {
  constructor(private readonly taxiService: TaxiService) {}

  @Post('location')
  async updateLocation(
    @Body() locationData: { latitude: number; longitude: number; to: string },
  ) {
    return this.taxiService.processLocation(locationData);
  }
}
