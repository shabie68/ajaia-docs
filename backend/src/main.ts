import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Updated CORS for both HTTP and WebSockets
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.1.17:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  });

  await app.listen(3001);
  console.log('🚀 NestJS Backend running on http://localhost:3001');
}
bootstrap();