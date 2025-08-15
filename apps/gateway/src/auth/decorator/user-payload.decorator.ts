import { UserPayloadDto } from "@app/common";
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const UserPayload = createParamDecorator<UserPayloadDto>((data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const {user} = req;

    if(!user) throw new InternalServerErrorException('뭔가 이상함');

    return req.user;
})