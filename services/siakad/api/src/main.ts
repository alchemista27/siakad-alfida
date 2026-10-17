import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { isAllowedCorsOrigin } from "./common/cors-policy";

export const SIAKAD_ALLOWED_ORIGINS = [
  "https://siakad.alfida.or.id",
  "https://auth.alfida.or.id",
  "https://sim.alfida.or.id",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
] as const;

export function configureApp(app: Pick<INestApplication, "use" | "setGlobalPrefix" | "enableCors">): void {
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => callback(null, isAllowedCorsOrigin(origin, SIAKAD_ALLOWED_ORIGINS)),
    credentials: true,
  });
}

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT || 3001, "0.0.0.0");
}

if (require.main === module) {
  void bootstrap();
}
