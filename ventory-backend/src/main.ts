import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix para todas las rutas de API
  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Ventory API")
    .setDescription("Documentación API para la aplicación Ventory")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api-docs", app, document);

  // 👇 Primero habilitamos CORS
  app.enableCors({
    origin: "http://localhost:4200",
    credentials: true,
  });

  // Luego configuramos pipes, etc.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Y por último arrancamos el servidor
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
