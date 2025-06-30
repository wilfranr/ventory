import { Test, TestingModule } from '@nestjs/testing';
import { ListTypeService } from './list-type.service';

describe('ListTypeService', () => {
  let service: ListTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListTypeService],
    }).compile();

    service = module.get<ListTypeService>(ListTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
