import { ArgumentsHost, Body, Catch, ConsoleLogger, Controller, ExceptionFilter, Get, HttpException, MiddlewareConsumer, Module, NestModule, NotFoundException, Param, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json } from 'body-parser';
import { Request, Response } from 'express';
import Server, { createProxyServer } from 'http-proxy';

const { EXPRESS_SERVER_URL } = process.env;
const logger = new ConsoleLogger('NotFoundException');

@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
  expressServerProxy: Server;

  constructor() {
    this.expressServerProxy = createProxyServer({
      target: EXPRESS_SERVER_URL,
    });
  }

  catch(_exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const endpoint = `${request.method} ${request.originalUrl}`;
    logger.log(`Proxying ${endpoint}...`);

    try {
      this.expressServerProxy.web(request, response, undefined, (error) => {
        logger.error(`Error proxying ${endpoint}: ${error}`);
        response.status(500).send('Something broke');
      });
    } catch (error) {
      logger.error(`Error proxying ${endpoint}: ${error}`);
      response.status(500).send('Something broke');
    }
  }
}

@Controller()
export class AppController {
  @Get('/get-endpoint/:id')
  getEndpoint(@Param('id') id: string) {
    if (id !== 'invalid-id') {
      return 'Hello world';
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  @Post('/post-endpoint')
  postEndpoint(@Body() body: any) {
    return `Hello world. ${JSON.stringify(body)}`;
  }
}

@Module({
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(json())
    .forRoutes('/post-endpoint');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.useGlobalFilters(new NotFoundFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
