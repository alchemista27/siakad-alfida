import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT || 3001, "0.0.0.0");
}

if (require.main === module) {
  void bootstrap();
}
