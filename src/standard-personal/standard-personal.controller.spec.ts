import { Test, TestingModule } from "@nestjs/testing";
import { StandardPersonalController } from "./standard-personal.controller";
import { StandardPersonalService } from "./standard-personal.service";

describe("StandardPersonalController", () => {
  let controller: StandardPersonalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StandardPersonalController],
      providers: [StandardPersonalService],
    }).compile();

    controller = module.get<StandardPersonalController>(
      StandardPersonalController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
