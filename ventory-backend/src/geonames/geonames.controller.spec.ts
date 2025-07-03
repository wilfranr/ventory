import { Test, TestingModule } from '@nestjs/testing';
import { GeonamesController } from './geonames.controller';

describe('GeonamesController', () => {
  let controller: GeonamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeonamesController],
    }).compile();

    controller = module.get<GeonamesController>(GeonamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
