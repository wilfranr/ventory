import { Test, TestingModule } from '@nestjs/testing';
import { ListTypeController } from './list-type.controller';
import { ListTypeService } from './list-type.service';

describe('ListTypeController', () => {
  let controller: ListTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListTypeController],
      providers: [ListTypeService],
    }).compile();

    controller = module.get<ListTypeController>(ListTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
