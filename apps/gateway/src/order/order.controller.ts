import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { Authorization } from '../auth/decorator/auth.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { TokenGuard } from '../auth/guard/token.guard';
import { UserPayloadDto } from '@app/common';
import { UserPayload } from '../auth/decorator/user-payload.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(TokenGuard)
  async createOrder(@UserPayload() userPayload: UserPayloadDto, @Body() createOrderDto: CreateOrderDto){
    return this.orderService.createOrder(createOrderDto, userPayload);
  }
}
