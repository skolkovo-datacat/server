import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {EntityNotFound} from './app.filters';
import {Logger, ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

const logger = new Logger('main.ts');

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: '*',
            credentials: true
        }
    })

    app.enableShutdownHooks()
    app.useGlobalFilters(new EntityNotFound)
    app.useGlobalPipes(new ValidationPipe)
    const configService = app.get(ConfigService);

    const swaggerOptions = new DocumentBuilder()
        .setTitle('Documentation')
        .setVersion('1.0.0')
        .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions)

    SwaggerModule.setup('docs', app, swaggerDocument);
    const appPort = configService.get('APP_PORT', 3000)

    await app.listen(appPort);
    logger.log(`Backend running on :${appPort}`)
}

bootstrap()
    .catch(e => console.log(e))
