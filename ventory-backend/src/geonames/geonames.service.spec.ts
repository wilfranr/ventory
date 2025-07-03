import { Test, TestingModule } from '@nestjs/testing';
import { GeonamesService } from './geonames.service';

describe('GeonamesService', () => {
  let service: GeonamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeonamesService],
    }).compile();

    service = module.get<GeonamesService>(GeonamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
