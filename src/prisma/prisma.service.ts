import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_URL!,
});

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter,
      log: ["error", "warn"],
    });
  }

  async onModuleInit() {
    console.log("Attempting to connect to database...");
    try {
      await this.$connect();
      console.log("✅ Database connected successfully");

      // Test query
      await this.$queryRaw`SELECT 1`;
      console.log("✅ Test query successful");
    } catch (error) {
      console.error("❌ Connection failed:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
