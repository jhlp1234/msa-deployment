import { Controller, Get, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common/interceptor/rpc.interceptor';
import { MakePaymentDto } from './dto/make-payment.dto';
import { PaymentMicroservice } from '@app/common';
import { MakePaymentRequest } from '@app/common/grpc/proto/payment';
import { PaymentMethod } from './entity/payment.entity';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/grpc/interceptor/grpc.interceptor';

@Controller('payment')
@UseInterceptors(GrpcInterceptor)
@PaymentMicroservice.PaymentServiceControllerMethods()
export class PaymentController implements PaymentMicroservice.PaymentServiceController {
  constructor(private readonly paymentService: PaymentService) {}

  // @MessagePattern({cmd: 'make_payment'})
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  makePayment(request: MakePaymentRequest, metadata: Metadata){
    return this.paymentService.makePayment({...request, paymentMethod: request.paymentMethod as PaymentMethod}, metadata);
  }
}
