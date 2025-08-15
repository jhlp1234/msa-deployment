import { Body, Controller, Get, Post, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrderMicroservice, RpcInterceptor } from '@app/common';
import { DeliveryStartedDto } from './dto/delivery-started.dto';
import { OrderStatus } from './entity/order.entity';
import { AddressDto } from './dto/address.dto';
import { PaymentMethod } from './entity/payment.entity';
import { PaymentDto } from './dto/payment.dto';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/grpc/interceptor/grpc.interceptor';

@Controller('order')
@UseInterceptors(GrpcInterceptor)
@OrderMicroservice.OrderServiceControllerMethods()
export class OrderController implements OrderMicroservice.OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  // @UsePipes(ValidationPipe)
  // @MessagePattern({cmd: 'create_order'})
  async createOrder(request: OrderMicroservice.CreateOrderRequest, metadata: Metadata){

    return this.orderService.createOrder(request as CreateOrderDto, metadata) as any;
  }

  // @EventPattern({cmd: 'delivery_started'})
  // @UseInterceptors(RpcInterceptor)
  async deliveryStarted(request: OrderMicroservice.DeliveryStartedRequest){
    return this.orderService.changeOrderStatus(request.id, OrderStatus.deliveryStarted);
  }
}
