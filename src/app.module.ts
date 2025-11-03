import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        onConnectionCreate: (connection: Connection) => {
          // Register event listeners here
          const logger = new Logger('Mongodb Logger');
          connection.on('connected', () => logger.log('Mongoose db connected'));
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule if not globally available
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'), // Get secret from config
          signOptions: {
            expiresIn: '14d',
          },
        };
      },
      inject: [ConfigService], // Inject ConfigService
      global: true,
    }),

    AuthModule,
    EventModule,
  ],
})
export class AppModule {}
