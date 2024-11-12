import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TaxiService } from './taxi.service';
import {
  LocationData,
  GroupStatus,
  LocationUpdateResponse,
} from './interfaces/taxi.interface';

@Controller('taxi')
export class TaxiController {
  constructor(private readonly taxiService: TaxiService) {}

  @Post('location')
  async updateLocation(
    @Body() locationData: LocationData,
  ): Promise<LocationUpdateResponse> {
    return this.taxiService.processLocation(locationData);
  }

  @Get('group/:groupId')
  async getGroupStatus(
    @Param('groupId') groupId: string,
  ): Promise<GroupStatus> {
    return this.taxiService.getGroupStatus(groupId);
  }
}
