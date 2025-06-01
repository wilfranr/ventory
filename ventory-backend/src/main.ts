import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Primero habilitamos CORS
  app.enableCors({
    origin: "http://localhost:4200",
    credentials: true,
  });

  // Global prefix para todas las rutas de API
  app.setGlobalPrefix("api");

  // Luego configuramos pipes, etc.
  app.useGlobalPipes(new ValidationPipe());

  // Y por último arrancamos el servidor
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
