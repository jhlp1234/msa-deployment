import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationStatus } from './entity/notification.entity';
import { Model } from 'mongoose';
import { constructMetadata, NOTIFICATION_SERVICE, ORDER_SERVICE, OrderMicroservice } from '@app/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class NotificationService implements OnModuleInit {
  orderService: OrderMicroservice.OrderServiceClient;

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    // @Inject(ORDER_SERVICE)
    // private readonly orderService: ClientProxy,
    @Inject(ORDER_SERVICE)
    private readonly orderMicroservice: ClientGrpc,
  ){}

  onModuleInit() {
    this.orderService = this.orderMicroservice.getService<OrderMicroservice.OrderServiceClient>('OrderService');
  }

  async sendPaymentNotification(data: SendPaymentNotificationDto, metadata: Metadata){
    const notification = await this.createNotification(data.to);
    await this.sendEmail();

    await this.updateNotificationStatus(notification._id.toString(), NotificationStatus.sent);
  
    this.sendDeliveryStartedMessage(data.orderId, metadata);

    const result = await this.notificationModel.findById(notification._id);
    if(!result) throw new NotFoundException('결과 없음');

    return result;
  }

  async updateNotificationStatus(id: string, status: NotificationStatus){
    return this.notificationModel.findByIdAndUpdate(id, {status});
  }

  async sendEmail(){
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async createNotification(to: string){
    return this.notificationModel.create({from: 'gamebrown777@gmail.com', to, subject: '배송 시작', content: '배송이 시작되었다'});
  }

  sendDeliveryStartedMessage(id: string, metadata: Metadata){
    this.orderService.deliveryStarted({id}, constructMetadata(NotificationService.name, 'sendDeliveryStartedMessage', metadata));
  }
}
