import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from './exception-filter/ws-exception-filter';
import { WsAuthMiddleware } from './middlewares/ws-auth-middleware';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(new WsExceptionFilter())
export class EventGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger('Socket Logger');
  @WebSocketServer()
  server: Server;
  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('Socket server initialized');
    server.use(WsAuthMiddleware(this.jwtService));
  }
  handleConnection(client: Socket) {
    this.logger.log(
      `Client connected: ${client.data.user.id}: ${client.data.user.name}`,
    );

    this.server
      .to(client.id)
      .emit('welcome', `Welcome client: ${client.data.user.name}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected:  ${client.data.user.id}: ${client.data.user.name}`,
    );
  }

  @SubscribeMessage('hello')
  welcomeClient(@ConnectedSocket() client: Socket) {
    return `Hello client with id: ${client.id} `;
  }

  @SubscribeMessage('edit-user')
  async editCurrentUser(
    @ConnectedSocket() client: Socket,
    @MessageBody('token') token: string,
  ) {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      client.data.user = decoded.user;
      return 'Success edit user';
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
