import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = exception.getResponse();

    // Create a WsException with the HTTP exception details
    const wsException = new WsException({
      status: status,
      message:
        typeof response === 'string' ? response : (response as any).message,
      // You can add more details if needed
    });

    // Delegate the exception processing to the base WebSocket filter
    super.catch(wsException, host);
  }
}
