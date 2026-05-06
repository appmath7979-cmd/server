import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import "dotenv/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
  app.setGlobalPrefix("api/v1");
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
