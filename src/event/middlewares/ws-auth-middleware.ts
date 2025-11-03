import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
export const WsAuthMiddleware = (jwtService: JwtService) => {
  return async (socket: Socket, next: Function) => {
    const token = socket.handshake.headers.token as string;

    if (!token) {
      return next(new UnauthorizedException());
    }
    try {
      const decoded = await jwtService.verifyAsync(token);
      socket.data.user = decoded.user;
      next();
    } catch (error) {
      next(new UnauthorizedException());
    }
  };
};
