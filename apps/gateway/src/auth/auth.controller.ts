import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Authorization } from './decorator/auth.decorator';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Authorization() token: string, @Body() registerDto: RegisterDto){
    if(!token) throw new UnauthorizedException('토큰 없음');

    return this.authService.register(token, registerDto);
  }

  @Post('login')
  loginUser(@Authorization() token: string){
    if(!token) throw new UnauthorizedException('토큰 없음');

    return this.authService.login(token);
  }
  
    // @MessagePattern({cmd: 'parse_bearer_token'})
    // @UseInterceptors(RpcInterceptor)
    // parseBearerToken(@Payload() payload: ParseBearerTokenDto){
    //   return this.authService.parseBearerToken(payload.token, false);
    // }
}
