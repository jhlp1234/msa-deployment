import { Controller, Get, NotFoundException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationMicroservice, RpcInterceptor } from '@app/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { SendPaymentNotificationRequest } from '@app/common/grpc/proto/notification';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/grpc/interceptor/grpc.interceptor';

@Controller('notification')
@UseInterceptors(GrpcInterceptor)
@NotificationMicroservice.NotificationServiceControllerMethods()
export class NotificationController implements NotificationMicroservice.NotificationServiceController {
  constructor(private readonly notificationService: NotificationService) {}

  // @MessagePattern({cmd: 'send_payment_notification'})
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  async sendPaymentNotification(request: SendPaymentNotificationRequest, metadata: Metadata){
    const resp = (await this.notificationService.sendPaymentNotification(request, metadata)).toJSON();

    return {...resp, status: resp.status.toString()};
  }
}
