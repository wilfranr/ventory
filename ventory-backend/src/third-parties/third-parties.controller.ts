import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ThirdPartiesService } from './third-parties.service';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateThirdPartyDto } from './dto/update-third-party.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('third-parties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThirdPartiesController {
  constructor(private readonly thirdPartiesService: ThirdPartiesService) {}

  @Post('clients')
  @Roles('admin', 'sales')
  async createClient(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser() user: any,
  ) {
    return this.thirdPartiesService.createClient(createClientDto, user.companyId);
  }

  @Post('providers')
  @Roles('admin', 'purchasing')
  async createProvider(
    @Body() createProviderDto: CreateProviderDto,
    @CurrentUser() user: any,
  ) {
    return this.thirdPartiesService.createProvider(createProviderDto, user.companyId);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.thirdPartiesService.findAll(user.companyId);
  }

  @Get('clients')
  async findClients(@CurrentUser() user: any) {
    return this.thirdPartiesService.findClients(user.companyId);
  }

  @Get('providers')
  async findProviders(@CurrentUser() user: any) {
    return this.thirdPartiesService.findProviders(user.companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.thirdPartiesService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Roles('admin', 'sales', 'purchasing')
  async update(
    @Param('id') id: string,
    @Body() updateThirdPartyDto: UpdateThirdPartyDto,
    @CurrentUser() user: any,
  ) {
    return this.thirdPartiesService.update(id, updateThirdPartyDto, user.companyId);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.thirdPartiesService.remove(id, user.companyId);
  }
}

