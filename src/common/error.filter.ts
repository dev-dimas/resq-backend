import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        message: getReasonPhrase(exception.getStatus()),
        error: exception.message,
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        message: 'Bad request!',
        errors: exception.errors,
      });
    } else if (exception.code === 'ENOENT') {
      response.status(404).json({
        message: 'Not found!',
        error: 'File not found',
      });
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}
