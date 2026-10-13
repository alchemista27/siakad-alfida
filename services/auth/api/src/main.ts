import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix("api");

  const allowedOrigins = [
    "https://auth.alfida.or.id",
    "https://simakin.alfida.or.id",
    "https://simpeg.alfida.or.id",
    "https://siyaum.alfida.or.id",
    "https://sim.alfida.or.id",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".alfida.or.id")) {
        callback(null, true);
      } else {
        callback(null, true); // Dev fallback
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, "0.0.0.0");
  console.log(`Auth API running on port ${port}`);
}

bootstrap();
