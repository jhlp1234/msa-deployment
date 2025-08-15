import { BadRequestException, Body, Controller, Post, UnauthorizedException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { EventPattern, MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ParseBearerTokenDto } from './dto/parse-bearer-token.dto';
import { RpcInterceptor } from '@app/common/interceptor/rpc.interceptor';
import { LoginDto } from './dto/login.dto';
import { UserMicroservice } from '@app/common';
import { RegisterUserResponse } from '@app/common/grpc/proto/user';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/grpc/interceptor/grpc.interceptor';

@Controller('auth')
@UseInterceptors(GrpcInterceptor)
@UserMicroservice.AuthServiceControllerMethods()
export class AuthController implements UserMicroservice.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // registerUser(@Authorization() token: string, @Body() registerDto: RegisterDto){
  //   if(!token) throw new UnauthorizedException('토큰 없음');

  //   return this.authService.register(token, registerDto);
  // }

  // @Post('login')
  // @UsePipes(ValidationPipe)
  // loginUser(@Authorization() token: string){
  //   if(!token) throw new UnauthorizedException('토큰 없음');

  //   return this.authService.login(token);
  // }

  // @MessagePattern({cmd: 'parse_bearer_token'})
  // @UsePipes(ValidationPipe)
  //@UseInterceptors(RpcInterceptor)
  parseBearerToken(payload: UserMicroservice.ParseBearerTokenRequest){
    return this.authService.parseBearerToken(payload.token, false);
  }

  //@MessagePattern({cmd: 'register'})
  registerUser(request: UserMicroservice.RegisterUserRequest){
    const {token} = request;
    if(!token) throw new UnauthorizedException('토큰 없음');

    return this.authService.register(token, request);
  }

  //@MessagePattern({cmd: 'login'})
  loginUser(request: UserMicroservice.LoginUserRequest, metadata: Metadata){
    console.log(metadata)
    const {token} = request;
    if(!token) throw new UnauthorizedException('토큰 없음');

    return this.authService.login(token);
  }
}
