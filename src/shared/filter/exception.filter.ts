import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errMessage = (status: number) => {
      if (status === 500) return exception.message?.slice(0, 50);

      return (
        (exception.getResponse() as any).message || 'Internal server error'
      );
    };

    this.logMessage(request, exception, status);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception.name,
      message: errMessage(status),
    };

    response.status(status).json(errorResponse);
  }

  logMessage(request: any, exception: HttpException, status: number) {
    Logger.error({
      statusCode: status,
      body: request.body,
      headers: request.headers,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception.name,
      stack: exception.stack,
    });
  }
}
