import { ArgumentsHost, Catch, ConsoleLogger, ExceptionFilter, NotFoundException } from '@nestjs/common';
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

    try {
      this.expressServerProxy.web(request, response, undefined, (error) => {
        logger.error(`Error proxying ${request.method} ${request.originalUrl}: ${error}`);
        response.status(500).end();
      });
    } catch (error) {
      logger.error(`Error proxying ${request.method} ${request.originalUrl}: ${error}`);
      response.status(500).end();
    }
  }
}


