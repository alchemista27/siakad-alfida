import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { isTrustedSiyaumOrigin } from "./ymq/cors.policy";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: (origin, callback) => callback(null, isTrustedSiyaumOrigin(origin) ? true : false),
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, "0.0.0.0");
  console.log(`Siyaum API running on port ${port}`);
}

bootstrap();
