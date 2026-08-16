import { Test, TestingModule } from "@nestjs/testing";
import { StandardPersonalService } from "./standard-personal.service";

describe("StandardPersonalService", () => {
  let service: StandardPersonalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StandardPersonalService],
    }).compile();

    service = module.get<StandardPersonalService>(StandardPersonalService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
