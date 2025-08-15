import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import * as Joi from 'joi';
import { NotificationModule } from "./notification/notification.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ORDER_SERVICE, OrderMicroservice, traceInterceptor } from "@app/common";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: Joi.object({
            DB_URL: Joi.string().required(),
        })
    }),
    MongooseModule.forRootAsync({
        useFactory: (configService: ConfigService) => ({
            uri: configService.getOrThrow('DB_URL'),
        }),
        inject: [ConfigService]
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          name: ORDER_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
              package: OrderMicroservice.protobufPackage,
              protoPath: join(process.cwd(), 'proto/order.proto'),
              url: configService.getOrThrow<string>('ORDER_GRPC_URL'),
              channelOptions: {
                  interceptos: [traceInterceptor('Notification')],
              }
            }
          }),
          inject: [ConfigService],
        }
      ],
      isGlobal: true,
    }),
    NotificationModule,
  ],
})
export class AppModule {}