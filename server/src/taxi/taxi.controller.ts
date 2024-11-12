import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TaxiService } from './taxi.service';

interface LocationUpdateDto {
  latitude: number;
  longitude: number;
  to: string;
  userId: string;
}

@Controller('taxi')
export class TaxiController {
  constructor(private readonly taxiService: TaxiService) {}

  @Post('location')
  async updateLocation(@Body() locationData: LocationUpdateDto) {
    return this.taxiService.processLocation(locationData);
  }

  @Get('group/:groupId')
  async getGroupStatus(@Param('groupId') groupId: string) {
    return this.taxiService.getGroupStatus(groupId);
  }
}
