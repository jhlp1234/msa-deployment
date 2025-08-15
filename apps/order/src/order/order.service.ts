import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { constructMetadata, PAYMENT_SERVICE, PaymentMicroservice, PRODUCT_SERVICE, ProductMicroservice, USER_SERVICE, UserMicroservice } from '@app/common';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';
import { Product } from './entity/product.entity';
import { Customer } from './entity/customer.entity';
import { AddressDto } from './dto/address.dto';
import { Payment } from './entity/payment.entity';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './entity/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentDto } from './dto/payment.dto';
import { PaymentFailedException } from './exception/payment-failed.exception';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class OrderService implements OnModuleInit {
  private userService: UserMicroservice.UserServiceClient;
  private productService: ProductMicroservice.ProductServiceClient;
  private paymentService: PaymentMicroservice.PaymentServiceClient;

  constructor(
    // @Inject(USER_SERVICE)
    // private readonly userService: ClientProxy,
    // @Inject(PRODUCT_SERVICE)
    // private readonly productService: ClientProxy,
    // @Inject(PAYMENT_SERVICE)
    // private readonly paymentService: ClientProxy,
    @Inject(USER_SERVICE)
    private readonly userMicroservice: ClientGrpc,
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservice: ClientGrpc,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentMicroservice: ClientGrpc,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ){}

  onModuleInit() {
    this.userService = this.userMicroservice.getService<UserMicroservice.UserServiceClient>('UserService');
    this.productService = this.productMicroservice.getService<ProductMicroservice.ProductServiceClient>('ProductService');
    this.paymentService = this.paymentMicroservice.getService<PaymentMicroservice.PaymentServiceClient>('PaymentService');
  }

  async createOrder(createOrderDto: CreateOrderDto, metadata: Metadata){
    const {productIds, address, payment, userPayloadDto} = createOrderDto;

    const user = await this.getUserFromToken(userPayloadDto.sub, metadata);

    const products = await this.getProductsByIds(productIds, metadata);

    const totalAmount = this.calculateTotalAmount(products);

    this.validatePaymentAmount(totalAmount, payment.amount);

    const customer = this.createCustomer(user);
    const order = await this.createNewOrder(customer, products, address, payment);
    
    await this.processPayment(order._id.toString(), payment, user.email, metadata);
  
    const result = await this.orderModel.findById(order._id);
    if(!result) throw new NotFoundException('결과 없음');

    return result;
  }

  private async getUserFromToken(userId: string, metadata: Metadata){
    // const resp = await lastValueFrom(this.userService.send({cmd: 'parse_bearer_token'}, {token}));
    // if(resp.status === 'error') throw new PaymentCancelledException(resp);

    //const userId = resp.data.sub;
    const uResp = await lastValueFrom(this.userService.getUserInfo({userId}, constructMetadata(OrderService.name, 'getUserFromToken', metadata)));
  
    return uResp;
  }

  private async getProductsByIds(productIds: string[], metadata: Metadata){
    const resp = await lastValueFrom(this.productService.getProductsInfo({productIds}, constructMetadata(OrderService.name, 'getProductsByIds', metadata)))
    
    return resp.products.map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
    }))
  }

  private calculateTotalAmount(product: Product[]){
    return product.reduce((acc, next) => acc + next.price, 0);
  }

  private validatePaymentAmount(totalA: number, totalB: number){
    if(totalA !== totalB){
      throw new PaymentCancelledException('금액 오류');
    }
  }

  private createCustomer(user: {id: string, email: string, name: string}){
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    }
  }

  private createNewOrder(customer: Customer, products: Product[], deliveryAddress: AddressDto, payment: PaymentDto){
    return this.orderModel.create({customer, products, deliveryAddress, payment});
  }

  private async processPayment(orderId: string, payment: PaymentDto, userEmail: string, metadata: Metadata){
    try {
      const resp = await lastValueFrom(this.paymentService.makePayment({
        orderId,
        ...payment,
        userEmail,
      }, constructMetadata(OrderService.name, 'processPayment', metadata)));
      const isPaid = resp.paymentStatus === 'Approved';
      const orderStatus = isPaid ? OrderStatus.paymentProcessed : OrderStatus.paymentFailed;
      if(orderStatus === OrderStatus.paymentFailed) throw new PaymentFailedException(resp);
    
      await this.orderModel.findByIdAndUpdate(orderId, {status: OrderStatus.paymentProcessed});
    
      return resp;
    } catch (error) {
      if(error instanceof PaymentFailedException){
        await this.orderModel.findByIdAndUpdate(orderId, {status: OrderStatus.paymentFailed});
      }
      throw error;
    }
  }

  changeOrderStatus(orderId: string, status: OrderStatus){
    return this.orderModel.findByIdAndUpdate(orderId, {status});
  }
}
