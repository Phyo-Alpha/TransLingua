import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(
        process.env.PORT || 4000,
        process.env.TRANSLATE_API_HOST_NAME!
    );
}
bootstrap();
