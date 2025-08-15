import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { lastValueFrom } from 'rxjs';
import { constructMetadata, ORDER_SERVICE, OrderMicroservice, UserPayloadDto } from '@app/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService implements OnModuleInit {
    orderService: OrderMicroservice.OrderServiceClient;

    constructor(
        @Inject(ORDER_SERVICE)
        private readonly orderMicroservice: ClientGrpc,
    ){}

    onModuleInit() {
        this.orderService = this.orderMicroservice.getService<OrderMicroservice.OrderServiceClient>('OrderService');
    }

    createOrder(createOrderDto: CreateOrderDto, userPayloadDto: UserPayloadDto){

        return lastValueFrom(this.orderService.createOrder({...createOrderDto, userPayloadDto}, constructMetadata(OrderService.name, 'createOrder')));
    }
}
