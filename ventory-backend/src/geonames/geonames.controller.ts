import { Controller, Get, Param } from '@nestjs/common';
import { GeonamesService } from './geonames.service';
import { Public } from '../auth/public.decorator';

@Controller('geonames')
export class GeonamesController {
  constructor(private readonly geonamesService: GeonamesService) {}

  @Public()
  @Get('countries')
  getCountries() {
    return this.geonamesService.getCountries();
  }

  @Public()
  @Get('departments/:countryCode')
  getDepartments(@Param('countryCode') countryCode: string) {
    return this.geonamesService.getDepartments(countryCode);
  }

  @Public()
  @Get('cities/:departmentId')
  getCities(@Param('departmentId') departmentId: string) {
    return this.geonamesService.getCities(departmentId);
  }
}