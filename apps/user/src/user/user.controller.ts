import { Controller, Get, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common/interceptor/rpc.interceptor';
import { GetUserInfoDto } from './dto/get-user-info.dto';
import { UserMicroservice } from '@app/common';
import { GrpcInterceptor } from '@app/common/grpc/interceptor/grpc.interceptor';

@Controller()
@UseInterceptors(GrpcInterceptor)
@UserMicroservice.UserServiceControllerMethods()
export class UserController implements UserMicroservice.UserServiceController {
  constructor(private readonly userService: UserService) {}

  // @MessagePattern({cmd: 'get_user_info'})
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  getUserInfo(request: UserMicroservice.GetUserInfoRequest){
    return this.userService.getUserById(request.userId);
  }
}
