import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: isHttpException
        ? exception.getResponse()
        : "Internal Server Error",
    };

    if (isHttpException) {
      const resp = exception.getResponse() as any;
      errorResponse.message =
        typeof resp === "string" ? resp : resp.message || resp;
    } else {
      errorResponse.message =
        process.env.NODE_ENV === "production"
          ? "Ocorreu um erro interno em nossos servidores. Nossa equipe já foi notificada."
          : (exception as Error).message;
    }

    response.status(status).json({
      success: false,
      error: errorResponse,
    });
  }
}
